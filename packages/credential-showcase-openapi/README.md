## credential-showcase-openapi

### Install the dependencies (Mac or Linux)

SDK Man

```shell
curl -s "https://get.sdkman.io" | bash
```
**If the sdk command is not available restart the terminal or run source .bashrc**

Java

Install the JDK
```shell
sdk install java 17.0.13-ms
```

Maven

```shell
sdk install maven 3.9.9
```

### Maven profiles

- typescript-fetch-models

### Generate the TypeScript models

```shell
mvn clean install -P <profile_id>
```

**Profile id defaults to typescript-fetch-models and may be ignored at the moment**
