#!/bin/sh
echo "Uninstalling DeckFAQs..."
sudo rm -r /home/deck/homebrew/plugins/deckfaqs

echo "Restarting PluginLoader"
sudo systemctl restart plugin_loader

echo "DeckFAQs uninstalled"
