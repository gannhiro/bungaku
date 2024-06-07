# What is bungaku?

bungaku is a simple manga reader for android that is powered by an API provided by MangaDex.

**DISCLAIMER**: Currently bungaku is in its very early development, please expect a lot of bugs and weird stuff happening.

## Features

Local Library - Users can download chapters of their favorite mangas provided by MangaDex. (note: Chapters removed by Scanlators will be removed locally as well to respect scanlator decisions.)

Background Downloads - When the app is connected via an unmetered connection, it will try its best to download new chapters in the background (killed state).

## Known Limitations & Bugs

- Downloading chapters stop when app is killed - when the user is downloading a chapter, killing the app will stop the download and corrupt the chapter. (Does not apply to background downloads that is already happening.)
- Limited themes - there are only 4 themes right now that are available.
- Laggy Webtoon reading mode - webtoon or vertical strip viewing sometimes is laggy, currently happens if the images take up too much RAM. Happens to 5%-ish of manhuas.
- Lacking Search Filters
- Most Settings Screen Functionality is not functional yet.
  Home screen is lacking components because they are not worked on yet.
  Limited Testing for Tablets

## Credits

- This android app is created using React Native 0.73
- Icons from Pictogrammers Material Design Icons
- Fonts used: Otomanopee One, Pretendard JP
- API provided by MangaDex

Thank you for reading.
-@gannhiro

## FAQ

### Can I contribute?

For now, no, you cannot contribute. Because I want this to be a solo project, I am making this repository public so people can see what happens under the hood so they can trust the project. But, if there is a pull request where the solution is amazing, I will credit them for making the solution. Also, please feel free to fork this repository and make your own version, but pretty please credit me.
