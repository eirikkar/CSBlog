## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (for the frontend)
- [dotnet-ef](https://docs.microsoft.com/en-us/ef/core/cli/dotnet) (Entity Framework Core CLI)

## Installation

### Backend

1. Navigate to the backend directory and create a folder for your database:

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

## Generating a Certificate

To run the application with HTTPS, you need to create a certificate. Follow these steps:

1. Generate a self-signed certificate:

   ```sh
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
   ```

2. Convert the certificate to a PFX file:

   ```sh
   openssl pkcs12 -export -out certificates/mycert.pfx -inkey key.pem -in cert.pem
   ```

3. Update the `appsettings.json` file with the path to your certificate and its password:
   ```json
   "Kestrel": {
     "Endpoints": {
       "Https": {
         "Url": "https://localhost:5073",
         "Certificate": {
           "Path": "certificates/mycert.pfx",
           "Password": "yourCertificatePassword"
         }
       }
     }
   }
   ```

Make sure to replace `"yourCertificatePassword"` with the actual password you used when creating the PFX file.

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
   npm dev run
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
