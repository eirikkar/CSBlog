## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (for the frontend)
- [dotnet-ef](https://docs.microsoft.com/en-us/ef/core/cli/dotnet) (Entity Framework Core CLI)

## Installation

### Backend

1. Navigate to the backend directory:

   ```sh
   cd backend
   ```

2. Install the required .NET tools:

   ```sh
   dotnet tool install --global dotnet-ef
   ```

3. Restore the .NET dependencies:

   ```sh
   dotnet restore
   ```

4. Apply the database migrations:
   ```sh
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

### Frontend

1. Navigate to the frontend directory:

   ```sh
   cd ../frontend
   ```

2. Install the required Node.js dependencies:
   ```sh
   npm install
   ```

## Starting the Application

### Backend

1. Navigate to the backend directory:

   ```sh
   cd backend
   ```

2. Start the backend server:
   ```sh
   dotnet run
   ```

### Frontend

1. Navigate to the frontend directory:

   ```sh
   cd ../frontend
   ```

2. Start the frontend development server:
   ```sh
   npm start
   ```

## Usage

1. Open your web browser and navigate to `http://localhost:5173` to access the frontend.
2. Use the admin credentials to log in:
   - Username: `admin`
   - Password: `test`
3. You can manage blog posts and user profiles from the admin panel.

## Notes

- The admin user is created automatically when the database is initialized. You can change the admin user details in the admin panel.
- Ensure that the backend server is running before starting the frontend development server.
