# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **LangGraph Integration**: Migrated AI agent from basic LangChain to LangGraph (v1.0.2)
  - StateGraph-based workflow architecture
  - Better state management for multi-turn conversations
  - Graph-based execution with conditional routing
  - Support for future sub-agents and specialized nodes
  - ToolNode for memory tool execution
- New documentation:
  - LANGGRAPH.md - Comprehensive guide to LangGraph implementation
  - langgraph-agent.feature - Gherkin specification for LangGraph features
- Updated README.md and ARCHITECTURE.md to reflect LangGraph usage

### Changed
- AI agent now uses `chatWithLangGraph` instead of `chatWithLangChain`
- Enhanced conversation flow with explicit graph structure
- Improved tool execution with ToolNode from @langchain/langgraph/prebuilt

### Technical
- Added @langchain/langgraph@1.0.2 dependency
- Created new langgraph-agent.ts implementation
- Maintained backward compatibility with existing API

## [1.0.0] - 2025-11-03

### Added
- Initial monorepo setup with workspace structure
- Next.js 14 chat application with:
  - AI-powered chat interface using LangChain
  - PostgreSQL database integration via Prisma ORM
  - Tailwind CSS styling
  - MCP client integration
  - Health check endpoint
- n8n workflow automation platform integration
- Model Context Protocol (MCP) server in TypeScript
- PostgreSQL 16 database service
- Docker containerization for all services
- Docker Compose orchestration
- Comprehensive documentation:
  - README.md with full setup instructions
  - QUICKSTART.md for quick setup
  - ARCHITECTURE.md for system design
  - MCP_INTEGRATION.md for MCP details
  - CONTRIBUTING.md for development guidelines
- Development tooling:
  - Makefile with common commands
  - Test setup script
  - Initialization script
  - GitHub Actions workflow for CI
- Environment configuration templates
- Database migrations
- Production override examples

### Features
- 🤖 AI Chat Interface with LangChain and OpenAI
- 🔄 n8n Workflow Automation
- 🔗 Model Context Protocol for inter-service communication
- 🗄️ PostgreSQL for data persistence
- 🐳 Fully Dockerized deployment
- 📦 Monorepo structure with workspaces
- 🎨 Modern UI with Tailwind CSS
- 🔧 Development and production configurations

### Technical Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js 20, TypeScript
- **AI/ML**: LangChain, OpenAI API
- **Database**: PostgreSQL 16, Prisma ORM
- **Automation**: n8n
- **Protocol**: Model Context Protocol (MCP)
- **Infrastructure**: Docker, Docker Compose

[1.0.0]: https://github.com/damien-danglard/busy/releases/tag/v1.0.0
