<div align="center">
  <img src="./android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" />
  <h1>bungaku</h1>
  <h4>bungaku is a simple manga reader for android that is powered by an API provided by MangaDex.</h4>
  <p>**DISCLAIMER**: Currently bungaku is in its very early development, please expect a lot of bugs and weird stuff happening.</p>
</div>

<br/>

## Features

1. Local Library - Users can download chapters of their favorite mangas provided by MangaDex. (note: Chapters removed by Scanlators will be removed locally as well to respect scanlator decisions.)

2. Background Downloads - When the app is connected via an unmetered connection, it will try its best to download new chapters in the background (killed state).

## Known Limitations & Bugs

1. Downloading chapters stop when app is killed - when the user is downloading a chapter, killing the app will stop the download and corrupt the chapter. (Does not apply to background downloads that is already happening.)
2. Limited themes - there are only 4 themes right now that are available.
3. Laggy Webtoon reading mode - webtoon or vertical strip viewing sometimes is laggy, currently happens if the images take up too much RAM. Happens to 5%-ish of manhuas.
4. Lacking Search Filters
5. Most Settings Screen Functionality is not functional yet.
6. Home screen is lacking components because they are not worked on yet.
7. Limited Testing for Tablets

## Credits

- This android app is created using React Native 0.73
- Icons from Pictogrammers Material Design Icons
- Fonts used: Otomanopee One, Pretendard JP
- API provided by MangaDex

Thank you for reading.
-@gannhiro

## FAQ

### Can I contribute?

For now, no, you cannot contribute. Because I want this to be a solo project, I am making this repository public so people can see what happens under the hood and can trust the project. Also, please feel free to fork this repository and make your own version, but pretty please credit me.

### Will there be an iOS release?

Technically since this is a React Native project, there should be an iOS release. However, I do not know of a way yet to properly install 3rd party apps because this app violates App Store TOS. Also, I don't have a Macbook yet; meaning no XCode, no iPhone simulators, no testing. So yeah, the answer would be: NO.
