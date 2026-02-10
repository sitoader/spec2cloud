---
agent: dev
---
# Setup Engineering Standards

Run the following commands to install APM packages and generate the AGENTS.md guardrails file:

```bash
# Check if APM is installed, install if not
if ! command -v apm &> /dev/null; then
    echo "APM not found. Installing APM CLI..."
    curl -sSL "https://raw.githubusercontent.com/danielmeppiel/apm/main/install.sh" | sh
    export PATH="$HOME/.local/bin:$PATH"
fi

# Install APM packages from apm.yml
apm install

# Generate AGENTS.md from all installed packages
apm compile
```

## What This Does

1. **`apm install`** - Reads `apm.yml` and installs all APM packages into `apm_modules/`
   - Downloads engineering standards from specified GitHub repositories
   - Supports semantic versioning (e.g., `@1.0.0` or `@latest`)
   - Creates `.gitignore` entry for `apm_modules/`

2. **`apm compile`** - Generates `AGENTS.md` from all installed standards
   - Scans `.apm/instructions/` in all installed packages
   - Consolidates rules based on file pattern matching (`applyTo`)
   - Creates comprehensive guardrails that all agents follow automatically

## Installed Packages

By default, spec2cloud includes:
- **danielmeppiel/azure-standards** - General engineering, documentation, agent-first patterns, CI/CD, security

You can add more packages by editing `apm.yml`:

```yaml
dependencies:
  apm:
    - danielmeppiel/azure-standards@1.0.0
    - danielmeppiel/python-backend@1.0.0  # Optional: Python backend rules
    - danielmeppiel/react-frontend@1.0.0  # Optional: React frontend rules
```

## Expected Output

After running these commands, you should see:
- `apm_modules/` directory with installed packages
- `AGENTS.md` file at the project root with consolidated standards

All agents will now automatically follow the engineering standards defined in AGENTS.md.

**Note**: Run this once at project setup, and again whenever you update APM packages.
