# ADR-0005: AI Service Selection for Book Recommendations

**Date**: 2025-11-11  
**Status**: Proposed

## Context

We need to select an AI service to power personalized book recommendations. This is the core differentiating feature of the application that sets it apart from simple book tracking tools.

**Requirements** (from FRD-004):
- Generate 5-10 personalized book recommendations based on user's reading history
- Provide human-readable explanations for each recommendation
- Process user data: read books, ratings (1-5 stars), notes, preferences (genres, themes, authors)
- Complete recommendation generation within 10 seconds
- Support on-demand generation (user-triggered, not pre-computed)
- Handle minimum data requirement (at least 3 rated books)
- Rate limiting: max 10 recommendation requests per user per day

**Input Data Structure**:
```json
{
  "readBooks": [{"title": "...", "author": "...", "genre": "...", "rating": 5, "notes": "..."}],
  "preferences": {"genres": [...], "themes": [...], "favoriteAuthors": [...]},
  "dislikedBooks": [{"title": "...", "rating": 1}]
}
```

**Output Requirements**:
- Book recommendations with title, author, genre, description
- Specific explanation referencing user's reading history
- Confidence/relevance ranking

**Constraints**:
- Cost optimization: AI calls must be sustainable (est. 10 requests/user/day, potentially 1000 users = 10k calls/day)
- Azure deployment preferred (aligned with infrastructure decisions)
- Simplicity-first: Avoid complex ML pipelines or custom model training

## Decision Drivers

- **Recommendation quality**: Ability to generate relevant, personalized suggestions
- **Explanation capability**: Can provide human-readable rationales
- **Azure integration**: Native Azure service with seamless deployment
- **Cost**: Per-request pricing that scales reasonably with usage
- **Performance**: Response time <10 seconds for recommendation generation
- **Ease of integration**: C# SDK availability (aligned with ADR-0002)
- **Reliability**: Service uptime, error handling, rate limits
- **Flexibility**: Can adjust prompts, parameters, model versions
- **Future-proofing**: Service roadmap, model improvements

## Considered Options

### Option 1: Azure OpenAI Service (GPT-4o)

**Description**: Microsoft's Azure-hosted OpenAI models with enterprise features, regional deployment, and Azure integration.

**Pros**:
- **Azure-native**: Deployed in Azure regions, same compliance/security as other Azure services
- **Excellent quality**: GPT-4o provides state-of-the-art natural language understanding
- **Explanation generation**: Naturally generates human-readable explanations
- **Official C# SDK**: Azure.AI.OpenAI NuGet package with strong typing
- **Flexible prompting**: Can iterate on prompts to improve recommendations
- **Structured output**: Supports JSON mode for consistent response format
- **Enterprise features**: Private endpoints, managed identity, RBAC, Azure Monitor integration
- **Cost control**: Per-token pricing with clear estimation, can set spending limits
- **Regional availability**: Can deploy in same region as app for lower latency
- **Compliance**: Microsoft-managed, meets enterprise compliance requirements

**Cons**:
- **Cost**: $2.50 per 1M input tokens, $10 per 1M output tokens (GPT-4o)
  - Est. 500 input tokens + 1000 output tokens per request = $0.011/request
  - 10k requests/day = $110/day = ~$3,300/month at scale
- **Token limits**: Need to manage context size (128k max, but costs increase with usage)
- **Rate limits**: Need to request quota increases for high throughput
- **Latency**: Streaming can help, but 5-10 seconds typical for quality responses
- **Dependency**: Reliant on Azure OpenAI service availability

### Option 2: OpenAI API (Direct)

**Description**: Use OpenAI's API directly (not through Azure) for GPT-4o access.

**Pros**:
- **Latest models**: Access to newest OpenAI models first
- **Simple setup**: Direct API integration, no Azure provisioning
- **Established service**: Proven reliability, large community
- **Flexible pricing**: Pay-as-you-go with credit card
- **Official SDK**: OpenAI C# SDK available

**Cons**:
- **Not Azure-hosted**: Data leaves Azure ecosystem (potential privacy/compliance issues)
- **Less enterprise features**: No private endpoints, Azure AD integration, RBAC
- **Regional latency**: API calls to OpenAI servers (may be outside Azure region)
- **Cost similar**: Pricing comparable to Azure OpenAI
- **No Azure integration**: Monitoring, logging separate from Azure Application Insights
- **Data sovereignty**: User reading data sent to OpenAI infrastructure

### Option 3: Custom Recommendation Algorithm (Collaborative Filtering + Content-Based)

**Description**: Build custom recommendation engine using traditional ML algorithms (collaborative filtering, TF-IDF, cosine similarity).

**Pros**:
- **Full control**: Complete customization of recommendation logic
- **Lower per-request cost**: No LLM API fees
- **Faster responses**: Can pre-compute similarities, faster inference
- **Privacy**: All processing happens in our infrastructure
- **Predictable costs**: Compute costs only, no per-token fees

**Cons**:
- **Development effort**: Significant engineering time to build, test, tune
- **Data requirements**: Collaborative filtering needs many users and ratings (cold start problem)
- **Explanation difficulty**: Hard to generate natural language explanations
- **Quality**: Likely lower quality than LLM-based recommendations initially
- **Maintenance**: Need to continuously improve and retrain models
- **Complexity**: Violates simplicity-first principle for MVP
- **Infrastructure**: Need to host ML model, manage versioning, monitoring

## Decision Outcome

**Chosen Option**: Azure OpenAI Service with GPT-4o (Option 1)

**Rationale**:

1. **Best fit for requirements**:
   - Generates high-quality, personalized recommendations
   - Naturally produces human-readable explanations referencing specific books
   - Can process complex user preferences and reading history
   - Handles variable data (3 books vs 100 books) without retraining

2. **Azure ecosystem alignment**:
   - Same compliance, security, and monitoring as other Azure services
   - Private endpoints and managed identity for security
   - Application Insights integration for observability
   - Deployed in same region as app (lower latency)
   - Regional data residency if required

3. **Development velocity**:
   - Official C# SDK with strong typing
   - Simple integration (API calls vs. ML pipeline)
   - Can start with basic prompts, iterate based on user feedback
   - No model training or data science expertise required for MVP

4. **Cost management**:
   - **MVP cost estimate**: <$100/month (assuming 100 active users, 10 requests/user/day)
     - 1,000 requests/day × $0.011/request = $11/day = $330/month
   - **Cost optimization strategies**:
     - Implement caching (24-hour recommendation cache per user)
     - Rate limiting (10 requests/user/day built into requirements)
     - Use GPT-4o-mini for simpler queries if quality sufficient ($0.15 per 1M input tokens, 60% cheaper)
     - Prompt optimization to reduce token usage
   - **Acceptable for value provided**: Recommendations are core differentiator, cost justified

5. **Quality and flexibility**:
   - State-of-the-art NLP for understanding preferences
   - Can tune prompts to improve recommendations without redeployment
   - Structured output (JSON mode) ensures consistent format
   - Future model improvements automatic (can upgrade to newer models)

6. **Simplicity-first principle**:
   - No ML infrastructure to build or maintain
   - No training data collection or model retraining pipelines
   - Clear API integration pattern
   - Focus on prompt engineering vs. algorithm development

**Why not direct OpenAI API**:
- Data leaves Azure (privacy concern for user reading data)
- Less Azure integration (monitoring, security, compliance)
- Regional latency potentially higher

**Why not custom algorithm**:
- Significantly more development effort
- Lower quality recommendations initially
- Difficult to generate natural language explanations
- Cold start problem with limited users
- Violates simplicity-first for MVP

## Consequences

### Positive

- **High-quality recommendations**: State-of-the-art AI produces relevant suggestions
- **Natural explanations**: GPT-4o generates compelling, specific rationales
- **Fast time-to-market**: No ML expertise or infrastructure required
- **Azure-native**: Security, compliance, monitoring integrated
- **Flexible**: Can improve via prompt engineering without redeployment
- **Scalable**: Azure OpenAI handles scaling automatically
- **Future-proof**: Benefit from model improvements over time

### Negative

- **Recurring cost**: Per-request pricing scales with usage ($330/month est. for 1000 requests/day)
- **External dependency**: Reliant on Azure OpenAI service availability
- **Rate limits**: May need to request quota increases for growth
- **Latency**: 5-10 seconds for response (acceptable per requirements but noticeable)
- **Token management**: Need to optimize prompts to control costs

### Neutral

- **Prompt engineering**: Requires iteration to optimize recommendation quality
- **Caching strategy**: Need to implement to reduce redundant API calls
- **Error handling**: Need robust retry logic for API failures

## Implementation Notes

1. **Azure OpenAI Setup**:
   - Provision Azure OpenAI resource in same region as app
   - Deploy GPT-4o model
   - Request quota allocation (default: 10k tokens/minute, may need increase)
   - Store API key and endpoint in Azure Key Vault

2. **C# SDK Integration**:
   ```csharp
   using Azure.AI.OpenAI;
   using Azure.Identity;
   
   var client = new AzureOpenAIClient(
       new Uri(endpoint),
       new DefaultAzureCredential()
   );
   ```

3. **Prompt Design**:
   ```
   System: You are a book recommendation expert. Analyze the user's reading 
   history and preferences to suggest 5-10 books they'll love. For each 
   recommendation, provide a specific explanation referencing books they've 
   rated highly or their stated preferences.
   
   User: [JSON with reading history, ratings, preferences]
   
   Response format: JSON array with {title, author, genre, description, 
   explanation}
   ```

4. **Cost Optimization**:
   - Cache recommendations for 24 hours (reduce redundant calls)
   - Implement rate limiting (10 requests/user/day per FRD-004)
   - Monitor token usage via Application Insights
   - Consider GPT-4o-mini for testing/development

5. **Performance**:
   - Use streaming for perceived responsiveness
   - Set max_tokens limit to control cost and latency
   - Implement timeout (15 seconds max)
   - Background queue for non-critical recommendation generation

6. **Error Handling**:
   - Retry logic with exponential backoff for transient failures
   - Graceful degradation if API unavailable (show message, allow manual book discovery)
   - Logging for failed requests (Application Insights)

7. **Monitoring**:
   - Track API call volume, latency, error rates
   - Monitor token usage and costs (Azure Cost Management)
   - Alert on quota limits approaching
   - User feedback on recommendation quality (thumbs up/down)

8. **Future Enhancements**:
   - Fine-tune model on book recommendation data if quality issues
   - Implement RAG (Retrieval-Augmented Generation) with book database for richer context
   - A/B test different prompt strategies
   - Consider GPT-4o-mini for cost savings if quality acceptable

## References

- FRD-004: `specs/features/ai-recommendations.md` - Complete AI recommendation requirements
- PRD: `specs/prd.md` - Section 3 (Goals), Section 6 (Constraints - AI cost optimization)
- ADR-0002: `specs/adr/0002-backend-framework.md` - ASP.NET Core C# integration
- Azure OpenAI Service: https://learn.microsoft.com/azure/ai-services/openai/overview
- Azure OpenAI Pricing: https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/
- C# SDK: https://learn.microsoft.com/dotnet/api/overview/azure/ai.openai-readme
