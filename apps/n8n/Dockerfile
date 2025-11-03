FROM n8nio/n8n:latest

# Set environment variables
# Default values are overridden by docker-compose.yml
ENV N8N_HOST=0.0.0.0
ENV N8N_PORT=5678
ENV N8N_PROTOCOL=http
ENV WEBHOOK_URL=http://localhost:5678/

# Expose the n8n port
EXPOSE 5678

# Use the default entrypoint from the base image
