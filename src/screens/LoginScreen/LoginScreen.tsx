import {
  Image,
  Keyboard,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputSubmitEditingEventData,
  ToastAndroid,
  Vibration,
  View,
} from 'react-native';
import {
  APP_NAME,
  ColorScheme,
  mangaDexOrange,
  PRETENDARD_JP,
  systemRed,
} from '@constants';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import React, {useEffect, useRef, useState} from 'react';
import {Button} from '@components';
import {StackScreenProps} from '@react-navigation/stack';
import * as Keychain from 'react-native-keychain';
import {
  mangadexAPI,
  res_post_auth_login,
  post_auth_login,
  res_get_user_me,
} from '@api';
import {RootStackParamsList} from '@navigation';
import {
  RootState,
  setError,
  setUserDetails,
  setUserTokens,
  useAppDispatch,
  useAppSelector,
} from '@store';
import {textColor} from '@utils';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

enum ERROR_DESCS {
  PASSWORD = '*Enter your password.',
  EMAIL_USERNAME = '*Enter your email/username.',
}

type Props = StackScreenProps<RootStackParamsList, 'LoginScreen'>;

export function LoginScreen({navigation}: Props) {
  const {colorScheme} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const dispatch = useAppDispatch();
  const styles = getStyles(colorScheme);

  const [usernameEmail, setUsernameEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [disableLoginBtn, setDisableLoginBtn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialInteraction, setInitialInteraction] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);

  function onChangeUsernameEmail(text: string) {
    if (!initialInteraction && password) {
      setInitialInteraction(true);
    }
    setUsernameEmail(text);
  }

  function onChangePassword(text: string) {
    if (!initialInteraction && usernameEmail) {
      setInitialInteraction(true);
    }
    setPassword(text);
  }

  function onSubmitUsernameEmail(
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
  ) {
    setUsernameEmail(e.nativeEvent.text);
    passwordInputRef.current?.focus();
  }

  async function onLoginBtnPress() {
    if (!usernameEmail) {
      ToastAndroid.show('Email/Username missing.', ToastAndroid.SHORT);
      return;
    }
    Keyboard.dismiss();
    setDisableLoginBtn(true);
    setLoading(true);
    const tokensData = await mangadexAPI<res_post_auth_login, post_auth_login>(
      'post',
      '/auth/login',
      {email: usernameEmail, username: usernameEmail, password: password},
      [],
    );

    if (tokensData && tokensData.result === 'ok') {
      const userDetailsData = await mangadexAPI<res_get_user_me, {}>(
        'get',
        '/user/me',
        {},
        [],
        tokensData.token.session,
      );

      if (userDetailsData && userDetailsData.result === 'ok') {
        await Keychain.setGenericPassword(
          userDetailsData.data.attributes.username,
          JSON.stringify({
            tokens: tokensData.token,
            userDetails: userDetailsData,
          }),
        );
        dispatch(setUserDetails(userDetailsData));
        dispatch(setUserTokens(tokensData.token));
        navigation.pop();
      }
      setDisableLoginBtn(false);
      setLoading(false);
    } else if (tokensData && tokensData.result === 'error') {
      dispatch(setError(tokensData));
      setLoading(false);
      setDisableLoginBtn(false);
    }
  }

  const eyeTap = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      Vibration.vibrate([0, 50], false);
      setShowPassword(!showPassword);
    });

  useEffect(() => {
    if (usernameEmail && password) {
      setDisableLoginBtn(false);
    } else {
      setDisableLoginBtn(true);
    }
  }, [usernameEmail, password]);

  return (
    <Animated.View style={[styles.container]}>
      <Animated.Text style={[styles.appTitle]}>{APP_NAME}</Animated.Text>
      <Animated.View style={styles.emailUsernameCont}>
        <Animated.Text style={[styles.formLabels]}>
          Email/Username
        </Animated.Text>
        <View style={styles.textInputCont}>
          <TextInput
            style={styles.emailUsernameTextInput}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={onSubmitUsernameEmail}
            onChangeText={onChangeUsernameEmail}
            blurOnSubmit={false}
          />
        </View>
        {!usernameEmail && initialInteraction ? (
          <Animated.Text
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.errorSubtext}>
            {ERROR_DESCS.EMAIL_USERNAME}
          </Animated.Text>
        ) : (
          <Text style={styles.errorSubtext} />
        )}
      </Animated.View>
      <Animated.View style={styles.emailUsernameCont}>
        <Animated.Text style={[styles.formLabels]}>Password</Animated.Text>
        <View style={styles.textInputCont}>
          <TextInput
            ref={passwordInputRef}
            onChangeText={onChangePassword}
            style={styles.emailUsernameTextInput}
            autoCapitalize="none"
            secureTextEntry={!showPassword}
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={onLoginBtnPress}
          />
          <GestureDetector gesture={eyeTap}>
            {showPassword ? (
              <Animated.Image
                entering={FadeIn}
                style={styles.eyeBtn}
                source={require('@assets/icons/eye.png')}
              />
            ) : (
              <Image
                style={styles.eyeBtn}
                source={require('@assets/icons/eye-off-outline.png')}
              />
            )}
          </GestureDetector>
        </View>

        {!password && initialInteraction ? (
          <Animated.Text
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.errorSubtext}>
            {ERROR_DESCS.PASSWORD}
          </Animated.Text>
        ) : (
          <Text style={styles.errorSubtext} />
        )}
      </Animated.View>
      <Button
        title="Login"
        containerStyle={styles.loginBtn}
        disabled={disableLoginBtn}
        onButtonPress={onLoginBtnPress}
        loading={loading}
      />
      <Text style={[styles.noteLabel]}>
        Note: bungaku uses old accounts from Manga
        <Text style={styles.mdexLabel}>Dex</Text>. If you have registered after
        2023, you sadly won't be able to login to bungaku. Until Manga
        <Text style={styles.mdexLabel}>Dex</Text> have updated their API, this
        will be the case. So please, stay tuned.
      </Text>
      <Animated.View />
    </Animated.View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    textInputCont: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colorScheme.colors.primary,
      marginTop: 5,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 10,
    },
    emailUsernameTextInput: {
      padding: 0,
      margin: 0,
      fontSize: 14,
      backgroundColor: colorScheme.colors.primary,
      color: textColor(colorScheme.colors.primary),
      flex: 1,
    },
    emailUsernameCont: {
      marginHorizontal: 55,
      marginBottom: 20,
    },
    emailUsernameTextInputContainer: {
      backgroundColor: colorScheme.colors.primary,
      marginTop: 5,
      paddingHorizontal: 10,
      paddingVertical: 3,

      borderRadius: 10,
    },
    passwordTextInput: {
      padding: 0,
      margin: 0,
      fontSize: 11,
    },
    passwordTextInputContainer: {
      marginHorizontal: 40,

      borderColor: colorScheme.colors.secondary,
      borderWidth: 1,
    },
    formLabels: {
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 11,
      color: textColor(colorScheme.colors.main),
    },
    noteLabel: {
      marginHorizontal: 60,
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 9,
      color: textColor(colorScheme.colors.secondary),
      textAlign: 'justify',
      padding: 10,
      backgroundColor: colorScheme.colors.secondary,
      borderRadius: 10,
    },
    appTitle: {
      marginHorizontal: 40,
      marginBottom: 40,
      fontSize: 28,
      fontFamily: PRETENDARD_JP.REGULAR,
      color: textColor(colorScheme.colors.main),
      textAlign: 'center',
    },
    mdexLabel: {
      color: mangaDexOrange,
    },
    loginBtn: {
      marginHorizontal: 55,
      marginBottom: 20,
    },
    errorSubtext: {
      fontSize: 8,
      fontFamily: PRETENDARD_JP.REGULAR,
      color: systemRed,
    },
    eyeBtn: {
      width: 25,
      height: 25,
      tintColor: textColor(colorScheme.colors.primary),
      marginLeft: 5,
    },
  });
}
