# Documentation

Bienvenue dans la documentation du projet **Busy** - votre assistant de travail automatisé.

## 📚 Table des matières

### Démarrage rapide
- [**QUICKSTART.md**](./QUICKSTART.md) - Guide de démarrage rapide pour installer et utiliser Busy

### Architecture et conception
- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - Architecture globale du système
- [**MCP_INTEGRATION.md**](./MCP_INTEGRATION.md) - Intégration du Model Context Protocol

### Guides de développement
- [**CONTRIBUTING.md**](./CONTRIBUTING.md) - Guide pour contribuer au projet
- [**IMPLEMENTATION_SUMMARY.md**](./IMPLEMENTATION_SUMMARY.md) - Résumé de l'implémentation
- [**IMPLEMENTATION_SUMMARY_AUTH.md**](./IMPLEMENTATION_SUMMARY_AUTH.md) - Implémentation de l'authentification

### Fonctionnalités
- [**AUTHENTICATION_FLOW.md**](./AUTHENTICATION_FLOW.md) - Flux d'authentification avec NextAuth.js
- [**MEMORY_RAG.md**](./MEMORY_RAG.md) - Système de mémoire RAG avec pgvector
- [**MEMORY_EXAMPLES.md**](./MEMORY_EXAMPLES.md) - Exemples d'utilisation de la mémoire
- [**LANGGRAPH.md**](./LANGGRAPH.md) - Agent IA avec LangGraph (StateGraph)

### Configuration
- [**LANGSMITH_SETUP.md**](./LANGSMITH_SETUP.md) - Configuration de LangSmith pour le monitoring

### Déploiement
- [**DEPLOYMENT_GUIDE.md**](./DEPLOYMENT_GUIDE.md) - Guide de déploiement en production

### Historique
- [**CHANGELOG.md**](./CHANGELOG.md) - Journal des modifications

## 🚀 Par où commencer ?

### Vous êtes nouveau ?
👉 Commencez par [QUICKSTART.md](./QUICKSTART.md)

### Vous voulez contribuer ?
👉 Lisez [CONTRIBUTING.md](./CONTRIBUTING.md)

### Vous voulez déployer en production ?
👉 Suivez [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Vous voulez comprendre l'architecture ?
👉 Consultez [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🔧 Technologies principales

- **Next.js 16** - Framework React pour l'interface
- **LangGraph** - Architecture graph-based pour l'agent IA
- **LangChain** - Framework pour les applications LLM et outils mémoire
- **Azure OpenAI** - Modèles GPT-4 et embeddings
- **PostgreSQL + pgvector** - Base de données avec recherche vectorielle
- **Prisma** - ORM pour la base de données
- **NextAuth.js** - Authentification
- **n8n** - Automatisation des workflows
- **Docker** - Conteneurisation

## 📝 Conventions

### Structure des documents
Chaque document suit une structure cohérente :
1. Introduction et objectif
2. Prérequis
3. Instructions détaillées
4. Exemples
5. Dépannage (si applicable)
6. Références

### Mise à jour de la documentation
Lorsque vous modifiez la documentation :
1. Mettez à jour la date en bas du document
2. Ajoutez une entrée dans CHANGELOG.md
3. Vérifiez que tous les liens internes fonctionnent

## 🆘 Besoin d'aide ?

- **Issues GitHub** - Signalez les bugs ou proposez des améliorations
- **Discussions** - Posez vos questions à la communauté

## 📄 Licence

Voir le fichier [LICENSE](../LICENSE) à la racine du projet.
