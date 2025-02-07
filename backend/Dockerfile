# Stage 1: Build and Publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /src

# Copy the project file(s) and restore as distinct layers
COPY CSBlog.csproj ./
RUN dotnet restore

# Copy the rest of the source code and publish the application in Release configuration
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Install the Entity Framework Core tools
RUN dotnet tool install --global dotnet-ef

# Ensure the global tools are available in the PATH
ENV PATH="$PATH:/root/.dotnet/tools"

# Apply migrations
WORKDIR /src
RUN dotnet ef database update

# Stage 2: Create the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# If you use HTTPS with a certificate, make sure the certificate file is copied to the image
COPY certificates/mycert.pfx ./certificates/mycert.pfx

COPY --from=build-env /app/publish .

# Copy the database file from the build stage
COPY --from=build-env /src/Data/Database /app/Data/Database

# Create the required directory structure for the database
RUN mkdir -p /app/Data/Database

# Create the Uploads directory if needed
RUN mkdir -p /app/Uploads

EXPOSE 5073
EXPOSE 80

ENTRYPOINT ["dotnet", "CSBlog.dll"]
