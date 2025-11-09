# Terraform Modular Development Guide

This document outlines the architecture and usage of the Terraform-based modular development environment for the NestJS application.

## Architecture Overview

The primary goal of this system is to create isolated, containerized development environments for specific features of the NestJS application. This is achieved by using Terraform to dynamically configure and run a Docker container that mounts only the necessary source code directories for the selected feature and its dependencies.

### Key Components

*   **`Dockerfile`**: A multi-stage Dockerfile that builds an optimized image for the application.
*   **`terraform/`**: A directory containing all the Terraform configuration files.
    *   **`main.tf`**: The core Terraform logic that defines the Docker image and container resources.
    *   **`module-dependencies.json`**: A manifest file that defines the source paths and interdependencies of each NestJS module.

### How it Works

1.  **Module Selection**: A developer specifies a list of modules they want to work on in the `enabled_modules` variable in `main.tf`.
2.  **Dependency Resolution**: Terraform reads `module-dependencies.json` to determine the full set of required modules, including all transitive dependencies.
3.  **Dynamic Volume Mounting**: Terraform dynamically constructs a list of volume mounts for the Docker container, including only the paths of the required modules.
4.  **Container Management**: Terraform builds the Docker image (if necessary) and runs the container with the specified volume mounts.

## Design Choices

*   **Terraform over Docker Compose**: While Docker Compose is excellent for defining multi-container applications, Terraform was chosen for its ability to handle complex dependency resolution and dynamic configuration. This allows for a more flexible and powerful modular setup.
*   **Centralized Dependency Map**: The `module-dependencies.json` file provides a single source of truth for the application's module architecture. This makes it easy to understand and extend the system, and it's designed to be easily integrated with future AI-driven tooling.
*   **Direct Docker Provider Integration**: By using the official Docker provider for Terraform, we can manage the entire lifecycle of the development environment with a single tool, simplifying the developer experience.

## How to Use

1.  **Install Terraform and Docker**: Ensure you have both Terraform and Docker installed on your local machine.
2.  **Select Modules**: Open `terraform/main.tf` and modify the `enabled_modules` variable to include the list of modules you want to work on. For example, to work on the `marketplace` feature, you would set the variable like this:
    ```hcl
    variable "enabled_modules" {
      description = "A list of NestJS modules to enable for the development environment."
      type        = list(string)
      default     = ["marketplace"]
    }
    ```
3.  **Initialize Terraform**: In the `terraform/` directory, run `terraform init` to initialize the providers.
4.  **Apply the Configuration**: Run `terraform apply` to create and start the development container.
5.  **Start Developing**: The application will be running on `http://localhost:3000`. Any changes you make to the source files of the enabled modules will be automatically reflected in the running container.

## Extending the System

To add a new module to the system, you need to update the `module-dependencies.json` file. For example, to add a new `authentication` module, you would add a new entry to the JSON file:

```json
"authentication": {
  "path": "src/authentication",
  "dependencies": ["npe"]
}
```

This tells Terraform where to find the module's source code and that it depends on the `npe` module.
