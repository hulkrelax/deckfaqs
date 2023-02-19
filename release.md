## DeckFAQs, a GameFAQs browser for the Steam Deck (v1.6.0)

-   Bump Decky Frontend Library version to fix issues with upcoming Steam Client changes
-   Add reload guide feature
-   Indicate guide is loading when table of content navigates to a new page
-   Improve compatibility with some guides that would not load at all. Some guides try to set style on html elements which breaks the parser. I've change it to just not accept the styling for the time being. It doesn't seem to have that horrible of an effect on guides so I think it should be fine.