# LangSmith Configuration Guide

LangSmith est une plateforme de monitoring, debugging et analytics pour les applications LangChain. Elle vous permet de :

- 📊 **Tracer** toutes les exécutions de vos chaînes LangChain
- 🐛 **Débugger** facilement les problèmes dans vos prompts et chaînes
- 📈 **Analyser** les performances et les coûts
- 🧪 **Tester** et évaluer vos prompts
- 🔍 **Monitorer** en production

## Configuration

### 1. Créer un compte LangSmith

1. Allez sur [https://smith.langchain.com/](https://smith.langchain.com/)
2. Inscrivez-vous avec votre compte GitHub, Google ou email
3. Créez votre premier projet (ou utilisez le projet par défaut)

### 2. Obtenir votre clé API

1. Dans LangSmith, cliquez sur votre avatar en haut à droite
2. Allez dans **Settings** > **API Keys**
3. Cliquez sur **Create API Key**
4. Donnez un nom à votre clé (ex: "busy-development")
5. Copiez la clé générée (elle ne sera affichée qu'une seule fois !)

### 3. Configurer les variables d'environnement

Dans votre fichier `.env`, décommentez et configurez les lignes suivantes :

```bash
# Activer le tracing LangSmith
LANGCHAIN_TRACING_V2=true

# Votre clé API LangSmith
LANGCHAIN_API_KEY=lsv2_pt_xxxxxxxxxxxxxxxxxxxxx

# Nom du projet (optionnel, par défaut: busy-chat-app)
LANGCHAIN_PROJECT=busy-chat-app

# Endpoint LangSmith (optionnel, par défaut: https://api.smith.langchain.com)
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
```

### 4. Redémarrer l'application

```bash
docker compose restart chat-app
```

### 5. Vérifier que ça fonctionne

1. Faites quelques requêtes dans votre application chat
2. Allez sur [https://smith.langchain.com/](https://smith.langchain.com/)
3. Sélectionnez votre projet "busy-chat-app"
4. Vous devriez voir vos traces apparaître en temps réel !

## Que verrez-vous dans LangSmith ?

Pour chaque requête dans l'application :
- Le prompt complet envoyé au modèle
- La réponse du modèle
- Les appels aux outils (memory tools)
- Le temps d'exécution de chaque composant
- Le nombre de tokens utilisés
- Les coûts estimés

## Exemple de trace

```
ChatWithLangChain (2.3s, $0.012)
├─ AzureChatOpenAI (2.1s, $0.01)
│  ├─ Input: "Hello, remember that I love pizza"
│  └─ Output: "I'll remember that you love pizza!"
└─ store_memory tool (0.2s, $0.002)
   ├─ Input: {content: "User loves pizza", category: "preferences"}
   └─ Output: "Memory stored successfully"
```

## Désactiver LangSmith

Pour désactiver temporairement LangSmith sans supprimer votre configuration :

```bash
LANGCHAIN_TRACING_V2=false
```

Ou commentez simplement la ligne dans votre `.env`.

## Environnements multiples

Vous pouvez utiliser différents projets pour différents environnements :

```bash
# Développement
LANGCHAIN_PROJECT=busy-dev

# Staging
LANGCHAIN_PROJECT=busy-staging

# Production
LANGCHAIN_PROJECT=busy-prod
```

## Ressources

- [Documentation LangSmith](https://docs.smith.langchain.com/)
- [Tutoriel vidéo](https://www.youtube.com/watch?v=XXX)
- [Exemples d'utilisation](https://docs.smith.langchain.com/cookbook)
