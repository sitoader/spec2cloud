using System.Reflection;
using System.Text;
using Azure.Identity;
using BookTracker.Api.Endpoints;
using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Models;
using BookTracker.Core.Repositories;
using BookTracker.Core.Services;
using BookTracker.Infrastructure.Data;
using BookTracker.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(new ConfigurationBuilder()
        .AddJsonFile("appsettings.json")
        .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", true)
        .Build())
    .CreateLogger();

try
{
    Log.Information("Starting BookTracker API");

    var builder = WebApplication.CreateBuilder(args);

    // Configure Serilog
    builder.Host.UseSerilog();

    // Add Azure Key Vault for production secrets
    if (builder.Environment.IsProduction())
    {
        var keyVaultUri = builder.Configuration["Azure:KeyVault:VaultUri"];
        if (!string.IsNullOrEmpty(keyVaultUri))
        {
            builder.Configuration.AddAzureKeyVault(
                new Uri(keyVaultUri),
                new DefaultAzureCredential());
        }
    }

    // Configure database context
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        options.UseSqlServer(connectionString);
    });

    // Configure ASP.NET Core Identity with ApplicationUser
    builder.Services.AddIdentity<ApplicationUser, IdentityRole>(cfg =>
    {
        // Password strength rules
        cfg.Password.RequiredLength = 8;
        cfg.Password.RequireUppercase = true;
        cfg.Password.RequireLowercase = true;
        cfg.Password.RequireDigit = true;
        cfg.Password.RequireNonAlphanumeric = false;

        // Lockout behavior
        cfg.Lockout.MaxFailedAccessAttempts = 5;
        cfg.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        cfg.Lockout.AllowedForNewUsers = true;

        // Email confirmation not required for v1
        cfg.SignIn.RequireConfirmedEmail = false;

        cfg.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

    // Register application services
    builder.Services.AddSingleton<JwtTokenService>();
    builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
    builder.Services.AddScoped<IBookRepository, BookRepository>();
    builder.Services.AddScoped<IBookService, BookService>();

    // Configure CORS
    var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>()
        ?? new[] { "http://localhost:3000" };

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });

    // Configure JWT authentication
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
    var key = Encoding.ASCII.GetBytes(secretKey);

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

    builder.Services.AddAuthorization();

    // Configure Swagger/OpenAPI
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "BookTracker API",
            Version = "v1",
            Description = "API for managing book library and AI-powered recommendations",
            Contact = new OpenApiContact
            {
                Name = "BookTracker Team",
                Email = "support@booktracker.com"
            }
        });

        // Add JWT authentication to Swagger
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });

        // Include XML comments
        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
        {
            options.IncludeXmlComments(xmlPath);
        }
    });

    // Configure HttpClient for external APIs
    builder.Services.AddHttpClient();

    // Add health checks
    builder.Services.AddHealthChecks()
        .AddDbContextCheck<ApplicationDbContext>();

    var app = builder.Build();

    // Configure global exception handler (must be first)
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.ContentType = "application/json";

            var exceptionHandlerFeature = context.Features.Get<IExceptionHandlerFeature>();
            if (exceptionHandlerFeature != null)
            {
                var exception = exceptionHandlerFeature.Error;
                Log.Error(exception, "Unhandled exception occurred");

                var statusCode = exception switch
                {
                    BookTracker.Core.Exceptions.UserAlreadyExistsException => StatusCodes.Status409Conflict,
                    BookTracker.Core.Exceptions.DuplicateBookException => StatusCodes.Status409Conflict,
                    BookTracker.Core.Exceptions.AccountLockedException => 423,
                    BookTracker.Core.Exceptions.AuthenticationException => StatusCodes.Status401Unauthorized,
                    BookTracker.Core.Exceptions.BookNotFoundException => StatusCodes.Status404NotFound,
                    BookTracker.Core.Exceptions.BookAccessDeniedException => StatusCodes.Status403Forbidden,
                    ArgumentException => StatusCodes.Status400BadRequest,
                    UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
                    KeyNotFoundException => StatusCodes.Status404NotFound,
                    _ => StatusCodes.Status500InternalServerError
                };

                context.Response.StatusCode = statusCode;

                var errorResponse = new ErrorResponse
                {
                    Message = app.Environment.IsDevelopment()
                        ? exception.Message
                        : "An error occurred processing your request.",
                    Errors = app.Environment.IsDevelopment()
                        ? new List<string> { exception.ToString() }
                        : null,
                    TraceId = context.TraceIdentifier
                };

                await context.Response.WriteAsJsonAsync(errorResponse);
            }
        });
    });

    // Configure Swagger
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "BookTracker API v1");
            options.RoutePrefix = "swagger";
        });
    }

    // HTTPS redirection
    app.UseHttpsRedirection();

    // CORS (must be before authentication/authorization)
    app.UseCors("AllowFrontend");

    // Authentication & Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // Map endpoints
    app.MapGet("/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }))
        .WithName("HealthCheck")
        .WithOpenApi()
        .AllowAnonymous();

    // Map health checks with details
    app.MapHealthChecks("/health/detailed")
        .AllowAnonymous();

    // Map authentication endpoints (register, login, logout, me)
    app.MapAuthEndpoints();

    // Map book library endpoints
    app.MapBookEndpoints();

    app.Run();

    return 0;
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
    return 1;
}
finally
{
    Log.CloseAndFlush();
}

// Make Program class accessible for integration tests
public partial class Program { }
