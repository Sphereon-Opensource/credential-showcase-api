# Credential Showcase Traction Adapter

**Version:** 0.1.0  
**License:** Apache-2.0  
**Author:** 4Sure

## 📢 Module Under Construction

The **Credential Showcase Traction Adapter** module is currently under development. As of now, the specific functionality and scope of the adapter have not been defined. Please check back for future updates as implementation progresses.

## 📁 Project Structure

```
credential-showcase-traction-adapter/
├── src/
│   └── index.ts          # Main entry point
│
├── __tests__/
│   └── rabbit-mq.test.ts # Temporary test for RabbitMQ
│
├── dist/                 # Compiled output
│
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Framework:** Express
- **Messaging:** rhea, rhea-promise
- **Dependency Injection:** typedi
- **Testing:** Jest, Testcontainers (@testcontainers/rabbitmq)

## 📦 Package Management

This project uses **pnpm** and **turbo** for monorepo and package management.

### Install Dependencies

```bash
pnpm install
```

### Build the Project

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```

For continuous integration tests:

```bash
pnpm test:ci
```

### Start the Project

```bash
pnpm start
```

## 🧪 Testing

The project includes a temporary test for RabbitMQ located at:

```
packages/credential-showcase-traction-adapter/src/__tests__/rabbit-mq.test.ts
```

Tests are executed using **Jest** with support for **Testcontainers** to spin up RabbitMQ instances.

## 📖 Documentation

Further documentation will be provided once the implementation details are finalized.


## 🏷️ License

This project is licensed under the **Apache-2.0** license.

---

_Repository: [Sphereon-Opensource/credential-showcase-api](https://github.com/Sphereon-Opensource/credential-showcase-api)_

