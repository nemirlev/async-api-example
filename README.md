# AsyncAPI Demo Project 🚀

[![GitHub Pages](https://img.shields.io/github/deployments/nemirlev/async-api-example/github-pages?label=GitHub%20Pages)](https://nemirlev.github.io/async-api-example/)

A demo project to get acquainted with AsyncAPI using the example of an order service. This project shows how to document asynchronous APIs and automatically create convenient documentation.

## 🎯 What's included?

- 📝 Example AsyncAPI specification for the order service
- 🌐 Automatically generated documentation on GitHub Pages
- 🔄 Live Demo for sending and receiving messages
- 🐳 Local environment on Docker (optional)

## 🚀 Быстрый старт

1. Click the "Fork" button in the upper right corner of this repository
2. In your copy of the repository, go to Settings -> Pages and enable GitHub Pages
3. After a few minutes, the documentation will be available at:
   `https://{username}.github.io/asyncapi-demo/`

## ✏️ How to make changes?

### Through the GitHub web interface:

1. Open the `asyncapi.yaml` file
2. Click the edit button (pencil icon)
3. Make changes
4. Click "Commit changes"
5. After 1-2 minutes, the changes will appear in the documentation

### Example changes:

1. Adding a new field to the order:
 ```yaml
# Find the OrderSchema section and add a new field
   properties:
     delivery_comments:  # New field
       type: string
       description: Delivery comments
       example: "Call one hour before delivery"
```
2. Changing the topic description:
```yaml
# Find the channels section and change the description
channels:
  order/created:
    description: |
      Your new topic description
      You can use markdown
```
## 🔍 What to see?

1. [API Documentation](https://nemirlev.github.io/async-api-example/) - automatically generated documentation
2. [Live Demo](./app-example/) - interactive demonstration
3. [asyncapi.yaml](./asyncapi.yaml) - source specification file

## 🎓 What can you try?

1. Add a new field to the order schema
2. Create a new topic for notifications
3. Enhance descriptions with markdown formatting
4. Add message examples

## ❓ Frequently Asked Questions

**Q: Where can I see the result of my changes?** A: After committing the changes, go to the GitHub Pages of your repository. The update takes 1-2 minutes.

**Q: Why are my changes not applied?** A: Check the validity of the YAML file. If there are errors, GitHub Actions will show them in the Actions section.

**Q: How can I check that my changes are correct?** A: After each commit, an automatic check is run. The results can be seen in the Actions tab.

## 🛠 Local Environment (optional)

If you want to run the project locally:

```bash
# Clone the repository
git clone your-fork

# Navigate to the project folder
cd async-api-example/app-example

# Start the Docker containers
docker-compose up -d

# Open the documentation
open http://localhost:8080
```

## 📚 Useful Links

- [AsyncAPI Documentation](https://www.asyncapi.com/docs/specifications/latest)
- [AsyncAPI Studio](https://studio.asyncapi.com/)
- [JSON Schema Reference](https://json-schema.org/understanding-json-schema/)
