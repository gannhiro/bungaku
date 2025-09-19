import {StatusBar} from 'react-native';
import {version as appVersion} from '../../package.json';

export const APP_NAME = '文学 bungaku';
export const APP_NAME_JP = '文学';
export const APP_NAME_EN = 'bungaku';

// these are gannhiro's favorite mangas!
export const DEVS_CHOICE = {
  'd773c8be-8e82-4ff1-a4e9-46171395319b':
    'I adore this series, it is basically like: "What if World War but with magic". It explores a lot of questions thematically and does so in a respectable manner. VERY interesting main protagonist and their conflict against God (yeah, with a big "G"). Absolute cinema right here.', // Saga of Tanya The Evil
  'b0b721ff-c388-4486-aa0f-c2b0bb321512':
    'A beautiful exploration of... a lot of things; like time, love, friends, and etc. Beautiful art, its story is very well paced, it can be comfy, it has riveting action. It asks a lot of things, but I think it asks the question: "What would Himmel do?"', // Sousou no Frieren
  'b05918e4-fb1a-4b10-a919-eaecf00fd7dd':
    'Relatively new as of writing (04/04/2024) but very intriguing world and plot, I mean like a big ass tower appeared outta nowhere? Sign me up! Its mysterious fantasy world filled with interesting characters and monsters feeds you crumbs that makes you want to know more! Very invested in where this one goes.', // Tower Dungeon
  'b2c8b779-b8d1-4be6-b66d-915f312a01c6':
    'Rough Sketch Senpai is a manga very dear to me. It\'s quite informative about famous art pieces in the world, but with that is a cute, very funny, "libido-filled", and comfy story and fun characters! (beautiful art too!). But sadly it has been cancelled, please read it so it will live on in our hearts!',
  '7c60af75-fc54-4740-8a62-131c4776de4b':
    "A very hard read but it is a much needed one in my humble opinion. It follows a JK that has been reincarnated to a fantasy world where she is, unfortunately, a sex worker. Thematically, it is amazing as it explores her situation in great detail; if there are implications you can think of while reading, I'd bet it is explored here.", // JK Haru is a Sex Worker in another world
};

export const APP_VERS = appVersion;

export const TOP_OVERLAY_HEIGHT = StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 20;
