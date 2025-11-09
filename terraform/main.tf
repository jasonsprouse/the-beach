terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 2.15.0"
    }
  }
}

variable "enabled_modules" {
  description = "A list of NestJS modules to enable for the development environment."
  type        = list(string)
  default     = ["app"]
}

locals {
  all_modules      = jsondecode(file("${path.module}/module-dependencies.json"))
  enabled_set      = toset(var.enabled_modules)

  required_modules = flatten([
    for module_name in var.enabled_modules : [
      module_name,
      local.all_modules[module_name].dependencies...
    ]
  ])

  required_paths = [
    for module_name in toset(local.required_modules) : local.all_modules[module_name].path
  ]
}

output "enabled_modules" {
  value = var.enabled_modules
}

output "required_modules" {
  value = toset(local.required_modules)
}

output "required_paths" {
  value = toset(local.required_paths)
}


resource "docker_image" "app" {
  name         = "nestjs-app"
  build {
    context = ".."
    dockerfile = "../Dockerfile"
  }
}

resource "docker_container" "app" {
  name  = "nestjs-app-container"
  image = docker_image.app.latest
  ports {
    internal = 3000
    external = 3000
  }
  volumes {
    host_path      = abspath("../public")
    container_path = "/usr/src/app/public"
  }
  # Additional volumes for each required path
  dynamic "volumes" {
    for_each = toset(local.required_paths)
    content {
      host_path      = abspath("../${volumes.value}")
      container_path = "/usr/src/app/${volumes.value}"
    }
  }
}
