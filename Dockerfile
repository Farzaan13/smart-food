# 1. Use the official Node.js image as the base
FROM node:20-bookworm

# 2. Install Python, pip, and virtual environment tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# 3. Set the working directory inside the server
WORKDIR /app

# 4. Copy your Node package files and install JS dependencies
COPY package*.json ./
RUN npm install

# 5. Copy all your project files (including the /ml folder and models)
COPY . .

# 6. Create the virtual environment EXACTLY where Node.js expects it
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# 7. Install your Python ML dependencies
RUN pip install -r requirements.txt

# 8. Start your Node.js application 
# (Leave this as server.js since that is your main file)
CMD ["node", "server.js"]
