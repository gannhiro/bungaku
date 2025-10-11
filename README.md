<div align="center">
  <img src="./android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" />
  <h1>bungaku</h1>
  <h4>bungaku is a simple manga reader for android that is powered by an API provided by MangaDex.</h4>
  <p><b>DISCLAIMER</b>: Currently bungaku is in its very early development, please expect a lot of bugs and weird stuff happening.</p>

| Preview | Comic Details | Reading Chapters | Download Chapters |
|---|---|---|---|
|![preview](https://github.com/user-attachments/assets/ebcc1075-19e5-48ae-8957-65953c77ab79)|![preview2](https://github.com/user-attachments/assets/8e5168ed-c2f4-4bf3-ba48-e47d1d3e9adf)|![preview3](https://github.com/user-attachments/assets/f259e205-daf9-4625-a15a-d2a978d6576f)|![preview6](https://github.com/user-attachments/assets/571c249b-15a5-41d5-b035-1a2987546dd5)
</div>

<br/>

## Features

1. Local Library - Users can download chapters of their favorite mangas provided by MangaDex.
2. Resistant Downloads - Currently ongoing downloads will resume at app start if the app was closed.

## Known Limitations & Bugs

1. UI translations are done with AI.
2. Limited themes, there are only 4 themes right now that are available.
3. Not yet tested with tablets.
4. No background updates yet.
5. No user onboarding.

## Credits

- This android app is created using bare React Native
- Icons from Pictogrammers Material Design Icons
- Fonts used: Otomanopee One, Pretendard JP
- API provided by MangaDex

Thank you for reading.
-@gannhiro

## FAQ

### Can I contribute?

Yes! I also encourage you to fork this repo and make your own version of bungaku (but pretty please credit me properly!).

### Will there be an iOS release?

Technically since this is a React Native project, there should be an iOS release. However, I do not know of a way yet to properly install 3rd party apps because this app violates App Store TOS. So yeah, the answer would be: NO.

## How to install
1. Starting in the project root folder, `yarn install`
2. `cd ios && pod install`
3. `yarn android` or `yarn ios`

## How to contribute

1. Please use these prefixes in your branches:
- feature/
- fix/
- chore/
- refactor/
- translations/ : if you want to contribute or fix a translation specifically, please use this instead

2. Please always add a description explaining briefly what the MR is all about.
