
# CSBlog

A sample application featuring a .NET 8 backend and a React frontend.

## Installation

The application consists of two main parts: the **backend** and the **frontend**. The provided Dockerfiles and Docker Compose file handle building and running these components along with a reverse proxy (Caddy) that provides HTTPS, automatic certificate management, and appropriate routing.

### 1. Clone the Repository

```sh
git clone https://github.com/eirikkar/CSBlog.git
cd CSBlog
```

### 2. Secrets and Persistent Data

- Create a folder called `secrets` in the project root.
- Place your JWT secret in `secrets/jwt_key.txt`.

The Docker Compose file mounts this folder into the backend and uses it as a Docker secret.

---


## Docker Setup

The project includes a `docker-compose.yml` file that defines three services:

- **backend**: Builds the .NET 8 backend, applies EF Core migrations, and persists data/uploads.
- **frontend**: Builds the React/Vite frontend.
- **caddy**: Uses the official Caddy image to provide HTTPS and route requests to the backend and frontend.


### Caddyfile

Below is an example `Caddyfile` configured for a production domain (e.g., `blog.hjemmesky.org`):

```caddyfile
blog.hjemmesky.org {
    encode gzip
    
    # Proxy requests for /uploads to the backend (which serves static files)
    handle /uploads/* {
        reverse_proxy backend:80
    }

    # Proxy API requests to the backend
    handle /api/* {
        reverse_proxy backend:80
    }
    
    # All other requests go to the frontend
    reverse_proxy frontend:3000
}
```
---

### Using Docker Compose

From the project root, run:

```sh
docker compose up --build
```

This command will:
- Build the backend and frontend images.
- Start the containers.
- Start Caddy to route incoming traffic from ports 80 and 443.

**Testing:**
- **Frontend:** Open your browser and navigate to `https://blog.hjemmesky.org`.
- **Backend API:** Access API endpoints at `https://blog.hjemmesky.org/api`.

---

## Deployment Automation

Below is a sample bash script (`deploy.sh`) that will:
- Stop the current containers.
- Pull the latest code from Git.
- Rebuild and restart Docker Compose services in detached mode.
- Show the status of the containers.

Create a file named `deploy.sh` at the root of your project with the following content:

```bash
#!/bin/bash
# deploy.sh - Updates code, rebuilds, and restarts Docker Compose services

set -e

# Use the current directory as the project directory
PROJECT_DIR="$(pwd)"

echo "Changing to project directory: $PROJECT_DIR"
cd "$PROJECT_DIR" || { echo "Failed to change directory"; exit 1; }

echo "Stopping current Docker Compose services..."
docker compose down

echo "Pulling latest changes from Git..."
git pull origin main

echo "Rebuilding and restarting Docker Compose services..."
docker compose up --build -d

echo "Deployment complete. Current status:"
docker compose ps
```

Make the script executable:

```sh
chmod +x deploy.sh
```

Then run it with:

```sh
./deploy.sh
```

---


## Notes

- **Data Persistence:**  
  Uploaded files are stored in the `uploads_data` volume and backend data in the `backend_data` volume.
- **Secrets:**  
  Ensure that the `secrets/jwt_key.txt` file exists and contains your JWT secret.
- **HTTPS:**  
  In production, Caddy automatically manages HTTPS certificates via Let’s Encrypt for valid domains.
- **Deployment:**  
  Use the provided `deploy.sh` script (or integrate it into your CI/CD pipeline) to update your server automatically.
