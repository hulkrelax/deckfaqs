#!/bin/sh
echo "Installing DeckFAQs..."

echo "Download v0.1.1"
curl -LJO https://github.com/hulkrelax/deckfaqs/releases/download/v0.1.1/deckfaqs.tar.gz

echo "Unzipping plugin to /home/deck/homebrew/plugins/"
sudo tar -xvf deckfaqs.tar.gz -C /home/deck/homebrew/plugins/
echo "DeckFAQs installed"
