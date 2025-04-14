# TetherBox 🤖

A Telegram bot that fetches and displays Tether (USDT) prices from multiple Iranian cryptocurrency exchanges.

## 📊 Features

- **Real-time Price Information**: Get current USDT prices from multiple exchanges:

  - Tetherland
  - Nobitex
  - Wallex
  - Exir
  - BitPin
  - Ramzinex

- **Automatic Updates**: Prices are automatically refreshed every 5 minutes in the bot's cache.

- **Price Subscriptions**: Users can subscribe to receive automatic price updates at intervals of their choice (hourly, daily, etc.).

- **Persian Language Support**: Fully supports Persian text and numbers.

## 🚀 Setup

### Prerequisites

- npm or yarn
- A Telegram bot token (get it from [BotFather](https://t.me/botfather))

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/sohseyedi-web/tetherboxbot
   cd tether-box
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```
   BOT_TOKEN=your_telegram_bot_token_here
   ```

4. Start the bot:
   ```
   npm start
   ```

## 🛠️ Project Structure

```
tether-box/
├── app/
│   ├── handlers/
│   │   ├── botHandlers.js    # Telegram bot message handlers
│   │   └── exchange.js       # Exchange handler definitions
│   └── utils/
│       ├── functions.js      # Helper functions
├── index.js                  # Main bot initialization
├── package.json
└── .env                      # Environment variables (not in repo)
```

## 💬 Bot Commands

- `/start` - Initialize the bot and see the welcome message
- `/help` or "درباره ربات" - Display help information
- `/price` or "قیمت تتر" - Get current Tether prices

## 🔄 How It Works

1. The bot fetches price data from multiple API endpoints
2. It caches the results to minimize API calls
3. Users can request prices or set up automatic notifications
4. The notification system checks user preferences and sends updates based on their preferred intervals

## 🔒 Privacy

- The bot only stores user IDs for sending notifications (in-memory only)
- No personal data is collected or stored

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Created with ❤️ by Sohseyedi

---

If you have any questions or suggestions, feel free to open an issue or submit a pull request.
