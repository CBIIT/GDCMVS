# Installation Guide

This document provides step-by-step instructions for installing and setting up the GDCMVS (GDC Metadata Validation Services) project on local development environments for both macOS and Windows.

## Prerequisites

### Required Software

1. **Node.js** (version 22.x or later required)
   - macOS: Download from [nodejs.org](https://nodejs.org/) or use Homebrew
   - Windows: Download installer from [nodejs.org](https://nodejs.org/)
   - **Important:** Node.js v22 or later is required for this project
   
2. **npm** (comes with Node.js installation)
   - Verify installation: `npm --version`

3. **Java** (required for Elasticsearch)
   - Elasticsearch requires Java to run
   - **Note:** Elasticsearch 7.17 distribution typically includes a bundled JDK, so you may not need to install Java separately
   - If Java is not bundled or you need to install separately:
     - **macOS:** `brew install openjdk@17` or download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
     - **Windows:** Download JDK 17 or later from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
   - Verify installation: `java -version` (should show Java 17 or later)

4. **Elasticsearch** (version 7.17 required)
   - Required for search functionality
   - **Important:** Use Elasticsearch version 7.17. Do NOT use version 8.x or newer as they are not compatible
   - **Note:** Elasticsearch 7.17 typically includes a bundled JDK, so you may not need to install Java separately
   - macOS: Use Homebrew or download version 7.17 from [elastic.co](https://www.elastic.co/downloads/past-releases/elasticsearch-7-17-0)
   - Windows: Download version 7.17 from [elastic.co](https://www.elastic.co/downloads/past-releases/elasticsearch-7-17-0)

5. **Git** (for cloning the repository)
   - macOS: Usually pre-installed or via Xcode Command Line Tools
   - Windows: Download from [git-scm.com](https://git-scm.com/download/win)

---

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/CBIIT/GDCMVS.git
cd GDCMVS
```

### Step 2: Install Node.js and npm

#### macOS

**Option A: Using Homebrew (Recommended)**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Option B: Using Official Installer**
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the macOS installer (.pkg file)
3. Run the installer and follow the instructions

**Verify installation:**
```bash
node --version
npm --version
```

> **Important:** Ensure Node.js version is v22.0.0 or later. If you have an older version, update it using `brew upgrade node` (macOS) or download the latest installer from nodejs.org (Windows).

#### Windows

1. Visit [nodejs.org](https://nodejs.org/)
2. Download the Windows installer (.msi file)
3. Run the installer:
   - Check the box to include npm package manager
   - Check the box to add to PATH
   - Complete the installation wizard
4. Restart your command prompt/terminal

**Verify installation:**
```cmd
node --version
npm --version
```

> **Important:** Ensure Node.js version is v22.0.0 or later. If you have an older version, download and install the latest version from nodejs.org.

### Step 3: Verify Java Installation (Optional)

Elasticsearch 7.17 typically includes a bundled JDK, so this step may not be necessary. However, if Elasticsearch fails to start, verify Java is available:

**Check if Java is installed:**
```bash
java -version
```

**macOS - Install Java if needed:**
```bash
brew install openjdk@17
```

**Windows - Install Java if needed:**
1. Download JDK 17 or later from [Adoptium](https://adoptium.net/) or [Oracle](https://www.oracle.com/java/technologies/downloads/)
2. Run the installer and follow the instructions
3. Set JAVA_HOME environment variable if not set automatically

> **Note:** If Elasticsearch distribution includes a bundled JDK, you typically do not need to install Java separately.

### Step 4: Install Elasticsearch

#### macOS

**Option A: Using Homebrew**
```bash
# Install Elasticsearch 7.17 specifically
brew install elasticsearch@7
# OR install from cask with version pinning
brew install --cask homebrew/cask-versions/elasticsearch@7

# Start Elasticsearch
brew services start elasticsearch@7
```

**Option B: Manual Installation (Recommended)**
1. Download Elasticsearch 7.17.0 from [Past Releases - Elasticsearch 7.17.0](https://www.elastic.co/downloads/past-releases/elasticsearch-7-17-0)
   - Select the macOS archive (`.tar.gz` file)
2. Extract the archive:
   ```bash
   tar -xzf elasticsearch-7.17.0-darwin-x86_64.tar.gz
   cd elasticsearch-7.17.0
   ```
3. Start Elasticsearch:
   ```bash
   ./bin/elasticsearch
   ```

> **Important:** Do NOT install Elasticsearch 8.x or newer as they are incompatible with this project.

#### Windows

1. Download Elasticsearch 7.17.0 from [Past Releases - Elasticsearch 7.17.0](https://www.elastic.co/downloads/past-releases/elasticsearch-7-17-0)
   - Select the Windows ZIP archive (`.zip` file)
2. Extract the ZIP archive to a location like `C:\Program Files\Elasticsearch`
   - Example: `C:\Program Files\Elasticsearch\elasticsearch-7.17.0`
3. Open Command Prompt as Administrator
4. Navigate to the Elasticsearch directory:
   ```cmd
   cd "C:\Program Files\Elasticsearch\elasticsearch-7.17.0\bin"
   ```
5. Start Elasticsearch:
   ```cmd
   elasticsearch.bat
   ```

> **Important:** Do NOT install Elasticsearch 8.x or newer as they are incompatible with this project. Only version 7.17 is supported.

**Verify Elasticsearch is running:**
- Open your browser and navigate to: `http://localhost:9200`
- You should see a JSON response with cluster information

> **Note:** Elasticsearch must be running before starting the application.

### Step 5: Install Project Dependencies

Navigate to the project directory and install npm packages:

```bash
npm install
```

This will install all dependencies listed in `package.json`, including:
- Express.js for the server
- Vite for client-side build
- Elasticsearch client
- Other required dependencies

**Expected output:**
- Installation may take a few minutes
- You should see `node_modules` folder created in the project root

### Step 6: Configure Environment Variables

**.env files are required in three locations:** the project root, `server/`, and `client/` folders.

#### Create .env files

You can either create empty `.env` files or copy from the provided templates:

**Option A: Copy from templates (Recommended)**

**macOS/Linux:**
```bash
# Copy template files to create .env files
cp .env_template .env
cp server/.env_template server/.env
cp client/.env_template client/.env
```

**Windows:**
```cmd
# Copy template files to create .env files
copy .env_template .env
copy server\.env_template server\.env
copy client\.env_template client\.env
```

**Option B: Create empty files**

**macOS/Linux:**
```bash
# Create .env files in root, server, and client folders
touch .env
touch server/.env
touch client/.env
```

**Windows:**
```cmd
# Create .env files in root, server, and client folders
type nul > .env
type nul > server\.env
type nul > client\.env
```

#### Root folder .env

If you copied from `.env_template`, review and update values as needed. Otherwise, add the following environment variables to the root `.env` file:

```env
NODE_ENV=development
PORT=3000
LOGDIR=./logs
```

**Root .env Variables Explained:**
- `NODE_ENV`: Set to `development` for local development (defaults to `prod` if not set)
- `PORT`: Port number for the server (defaults to `3000` if not set)
- `LOGDIR`: Directory for log files (defaults to `/local/content/mvs/logs` if not set)

> **Note:** For Windows, use a relative path like `./logs` for `LOGDIR`, or an absolute Windows path like `C:\logs`

#### Server folder .env

If you copied from `server/.env_template`, review and uncomment/add any needed variables. Otherwise, create `server/.env` file. Add server-specific environment variables as needed. At minimum:

```env
# Add server-specific configuration here if required
```

#### Client folder .env

If you copied from `client/.env_template`, review and uncomment/add any needed variables. Otherwise, create `client/.env` file. Add client-specific environment variables as needed. At minimum:

```env
# Add client-specific configuration here if required
```

> **Important:** All three `.env` files (root, `server/`, and `client/`) are required, even if some remain empty or minimal. The application expects these files to exist.

### Step 7: Build the Client Application

Build the client-side code using Vite:

```bash
npm run build
```

This will create the production bundle in `client/static/dist/`.

**Alternative:** For development with auto-rebuild on changes:
```bash
npm run watch
```

### Step 8: Start the Application

Start the Node.js server:

```bash
npm start
```

Or if you prefer to run it directly:

```bash
node app.js
```

**Expected output:**
```
GDCMVS listening on port :3000
```

> **Important:** Keep the server running in this terminal window. You'll need it running for the next step.

### Step 9: Create or Update Elasticsearch Index

Before using the application, you need to create or update the Elasticsearch index. This step requires both Elasticsearch and the Node.js server to be running.

**Important:** If you have old Elasticsearch indices from a previous installation, you should delete them first to avoid conflicts.

#### Delete Old Elasticsearch Indices (Optional but Recommended)

**macOS/Linux:**
```bash
curl -X DELETE http://localhost:9200/_all
```

**Windows:**
```cmd
curl -X DELETE http://localhost:9200/_all
```

> **Note:** This command deletes all indices in Elasticsearch. Only run this if you want to start fresh or if you're setting up the project for the first time.

#### Build Elasticsearch Index

In a new terminal/command prompt window (keep the server running in the original terminal), run:

**macOS/Linux:**
```bash
curl http://localhost:3000/search/buildIndex
```

**Windows:**
```cmd
curl http://localhost:3000/search/buildIndex
```

**Expected output:**
- The command may take a few minutes to complete
- You should see a response indicating the index build process has started or completed
- The response may be empty or show JSON data depending on the endpoint implementation

> **Note:** 
> - Make sure Elasticsearch is running (check `http://localhost:9200`)
> - Make sure the Node.js server is running (from Step 8)
> - If you encounter errors, check that both services are running and accessible

### Step 10: Verify Installation

1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. You should see the GDCMVS application interface
4. Verify that search functionality works (this confirms the Elasticsearch index is properly built)

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
- Ensure you've run `npm install` in the project root
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Issue: Elasticsearch connection errors

**Solution:**
- Verify Elasticsearch is running: `curl http://localhost:9200` (macOS/Linux) or visit `http://localhost:9200` in browser
- Check that Elasticsearch is configured to run on `127.0.0.1:9200` (default)
- On Windows, ensure Elasticsearch service is running or start it manually
- Check firewall settings if connection fails

### Issue: Elasticsearch version incompatibility

**Solution:**
- This project requires Elasticsearch version 7.17. Version 8.x or newer will NOT work
- Check your Elasticsearch version:
  - Visit `http://localhost:9200` in your browser and look for the `version.number` field in the JSON response
  - Or run: `curl http://localhost:9200 | grep version` (macOS/Linux)
- If you have version 8.x or newer installed, uninstall it and install version 7.17.0:
  - **macOS:** Stop Elasticsearch, then install 7.17.0 using the manual installation method above
  - **Windows:** Stop the Elasticsearch service, uninstall, then install 7.17.0 using the Windows installation method above
- Verify the version after installation: `curl http://localhost:9200` should show `"version":{"number":"7.17.0"}`

### Issue: Elasticsearch fails to start (Java-related errors)

**Solution:**
- Elasticsearch requires Java to run. Even though Elasticsearch 7.17 typically includes a bundled JDK, you may encounter Java-related errors
- Check if Java is available:
  ```bash
  java -version
  ```
- If Java is not found or you see errors:
  - **macOS:** Install Java using `brew install openjdk@17`
  - **Windows:** Download and install JDK 17 or later from [Adoptium](https://adoptium.net/)
- Set JAVA_HOME environment variable if needed:
  - **macOS:** Add to `~/.zshrc` or `~/.bash_profile`:
    ```bash
    export JAVA_HOME=$(/usr/libexec/java_home)
    ```
  - **Windows:** Set JAVA_HOME in System Environment Variables to your JDK installation path (e.g., `C:\Program Files\Java\jdk-11`)
- If using Elasticsearch with a bundled JDK, ensure the bundled JDK is working. Try using the full path to Elasticsearch's bundled Java if needed
- Restart your terminal/command prompt after setting JAVA_HOME

### Issue: Elasticsearch index build fails or search not working

**Solution:**
- Ensure Elasticsearch is running: Visit `http://localhost:9200` in your browser or run `curl http://localhost:9200`
- Ensure the Node.js server is running: Check that you see "GDCMVS listening on port :3000" in the server terminal
- Verify the index build command completed successfully:
  ```bash
  curl http://localhost:3000/search/buildIndex
  ```
- Check Elasticsearch indices exist:
  ```bash
  curl http://localhost:9200/_cat/indices?v
  ```
  You should see indices like `gdc`, `gdc-suggestion`, `gdc-p`, `gdc-v`, etc.
- If indices are missing or search fails:
  - Delete old indices (optional, for fresh start):
    ```bash
    curl -X DELETE http://localhost:9200/_all
    ```
  - Rebuild the index:
    ```bash
    curl http://localhost:3000/search/buildIndex
    ```
- Check server logs for error messages related to Elasticsearch
- Ensure Elasticsearch version is 7.17 (version 8.x or newer will not work)

### Issue: Port 3000 already in use

**Solution:**
- Change the `PORT` value in your `.env` file to a different port (e.g., `3001`)
- Or, stop the process using port 3000:
  - **macOS/Linux:** `lsof -ti:3000 | xargs kill -9`
  - **Windows:** Find the process using `netstat -ano | findstr :3000`, then kill it using Task Manager

### Issue: Build errors with Vite

**Solution:**
- Ensure you're using Node.js version 22.x or later (check with `node --version`)
- If you have an older version, upgrade Node.js:
  - **macOS:** `brew upgrade node` or download from nodejs.org
  - **Windows:** Download and install the latest version from nodejs.org
- Clear the build cache: Delete `client/static/dist` and `node_modules/.vite` (if exists)
- Run `npm run build` again

### Issue: Node.js version incompatibility

**Solution:**
- This project requires Node.js v22.0.0 or later
- Check your current version: `node --version`
- Upgrade if necessary:
  - **macOS:** `brew upgrade node` or use `nvm install 22 && nvm use 22` (if using nvm)
  - **Windows:** Download and install Node.js v22 or later from nodejs.org

### Issue: Permission errors (macOS/Linux)

**Solution:**
- Ensure you have write permissions in the project directory
- If needed, adjust permissions: `chmod -R 755 .` (use with caution)

### Issue: Missing log directory errors

**Solution:**
- Create the log directory manually:
  - **macOS/Linux:** `mkdir -p logs`
  - **Windows:** `mkdir logs`
- Or update `LOGDIR` in `.env` to an existing directory

### Issue: Missing .env files

**Solution:**
- The application requires `.env` files in three locations: root folder, `server/`, and `client/`
- Copy from template files (recommended):
  - **macOS/Linux:**
    ```bash
    cp .env_template .env
    cp server/.env_template server/.env
    cp client/.env_template client/.env
    ```
  - **Windows:**
    ```cmd
    copy .env_template .env
    copy server\.env_template server\.env
    copy client\.env_template client\.env
    ```
- Or create empty files manually:
  - **macOS/Linux:**
    ```bash
    touch .env
    touch server/.env
    touch client/.env
    ```
  - **Windows:**
    ```cmd
    type nul > .env
    type nul > server\.env
    type nul > client\.env
    ```
- At minimum, add the required variables to the root `.env` file:
  ```env
  NODE_ENV=development
  PORT=3000
  LOGDIR=./logs
  ```
- The `server/.env` and `client/.env` files can remain empty if no additional configuration is needed, but they must exist

---

## Development Workflow

### Running in Development Mode

1. Set `NODE_ENV=development` in the root `.env` file
2. Ensure all three `.env` files exist (root, `server/`, and `client/`)
3. Start Elasticsearch
4. Build the client (or use watch mode):
   ```bash
   npm run watch
   ```
5. In another terminal, start the server:
   ```bash
   npm start
   ```

### Available npm Scripts

- `npm start` - Start the server
- `npm run build` - Build the client application
- `npm run watch` - Build the client application in watch mode (auto-rebuild on changes)
- `npm test` - Run tests
- `npm run skip-test` - Run tests with skipped tests

---

## Additional Notes

### Project Structure

- `app.js` - Main server entry point
- `server/` - Server-side code and configuration
- `client/` - Client-side application code
- `client/src/` - Source files for the frontend
- `client/static/dist/` - Built/bundled client files (generated after build)
- `routes.js` - Application routes
- `vite.config.js` - Vite build configuration

### Configuration Files

- `server/config/development.js` - Development environment configuration (Elasticsearch settings)
- `server/config/prod.js` - Production environment configuration
- `.env_template` - Template for root environment variables (copy to `.env`)
- `server/.env_template` - Template for server environment variables (copy to `server/.env`)
- `client/.env_template` - Template for client environment variables (copy to `client/.env`)
- `.env` - Root environment variables (copy from `.env_template` and configure)
- `server/.env` - Server-specific environment variables (copy from `server/.env_template` and configure)
- `client/.env` - Client-specific environment variables (copy from `client/.env_template` and configure)

### Elasticsearch Configuration

The application uses Elasticsearch with the following default settings in development:
- Host: `127.0.0.1:9200`
- Log level: `error`
- Timeout: `300000ms`

These can be modified in `server/config/development.js` if needed.

---

## System Requirements

### Minimum Requirements

- **RAM:** 4GB (8GB recommended)
- **Disk Space:** 2GB free space
- **Operating System:** 
  - macOS 10.14 or later
  - Windows 10 or later

### Recommended Requirements

- **RAM:** 8GB or more
- **Disk Space:** 5GB free space
- **Node.js:** Version 22.x or later (required)

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the project's GitHub repository: [https://github.com/CBIIT/GDCMVS](https://github.com/CBIIT/GDCMVS)
2. Review server logs in the configured log directory
3. Check Elasticsearch logs (usually in the Elasticsearch installation directory)

---

## Quick Start Summary

For experienced developers, here's a quick reference:

```bash
# 1. Install Node.js and npm (if not installed)
# 2. Install and start Elasticsearch

# 3. Clone and setup
git clone https://github.com/CBIIT/GDCMVS.git
cd GDCMVS
npm install

# 4. Create .env files from templates (required in root, server, and client folders)
cp .env_template .env
cp server/.env_template server/.env
cp client/.env_template client/.env
# Review and update .env files as needed

# 5. Build and start
npm run build
npm start

# 6. Create/update Elasticsearch index (in a new terminal, keep server running)
# Optional : when new GDCMVS disctionary data is loaded or first time set up
# Optional: Delete old indices first
curl -X DELETE http://localhost:9200/_all
# Build index
curl http://localhost:3000/search/buildIndex

# 7. Visit http://localhost:3000
```

---

**Last Updated:** 2025
**Project Version:** v2.2.19

