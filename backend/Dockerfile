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

RUN apt-get update

RUN apt-get install sqlite3 -y

COPY --from=build-env /app/publish .

# Copy the database file from the build stage
COPY --from=build-env /src/Data/Database /app/Data/Database

COPY --from=build-env /src/Uploads /app/Uploads

EXPOSE 80

ENTRYPOINT ["dotnet", "CSBlog.dll"]
