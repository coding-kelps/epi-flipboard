# Contributing to This Project

To maintain a consistent and readable project history, **all commits must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.**

## 🧩 Commit Message Guidelines

Each commit message must be structured as follows:

```
<type>(optional scope): <short description>

[optional body]

[optional footer(s)]
```

### 🔑 Allowed `<type>` Keywords

Use one of the following **commit types**:

| Type         | Description                                           |
| ------------ | ----------------------------------------------------- |
| **feat**     | Introduce a new feature                               |
| **fix**      | Fix a bug                                             |
| **docs**     | Add or update documentation only                      |
| **perf**     | Improve performance                                   |
| **refactor** | Code changes that neither fix a bug nor add a feature |
| **style**    | Code style or formatting changes (no logic changes)   |
| **test**     | Add or modify tests                                   |
| **build**    | Changes that affect the build system or dependencies  |
| **chore**    | Other changes that don’t modify src or test files     |
| **ci**       | Changes to CI/CD configuration or scripts             |
| **revert**   | Revert a previous commit                              |

## ✍️ Example Commits

```
feat(auth): add JWT authentication support
fix(api): correct null reference error on login
docs(readme): update installation instructions
style(lint): format code with Prettier
test(user): add integration tests for user service
chore(deps): update eslint to latest version
```
