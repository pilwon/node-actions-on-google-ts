import { Request, Response } from 'express';

import { AssistantApp, DeviceLocation, SessionStartedFunction, User } from './assistant-app';
import { Carousel, List, RichResponse, SimpleResponse } from './response-builder';
import { TransactionDecision } from './transactions';

// ---------------------------------------------------------------------------
//                   Actions SDK support
// ---------------------------------------------------------------------------

export interface ActionsSdkAppOptions {
  request: Request;
  response: Response;
  sessionStarted?: SessionStartedFunction;
}

/**
 * This is the class that handles the conversation API directly from Assistant,
 * providing implementation for all the methods available in the API.
 */
export class ActionsSdkApp extends AssistantApp {
  /**
  * Constructor for ActionsSdkApp object.
  * To be used in the Actions SDK HTTP endpoint logic.
  *
  * @example
  * const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
  * const app = new ActionsSdkApp({request: request, response: response,
  *   sessionStarted:sessionStarted});
  *
  * @param {Object} options JSON configuration.
  * @param {Object} options.request Express HTTP request object.
  * @param {Object} options.response Express HTTP response object.
  * @param {Function=} options.sessionStarted Function callback when session starts.
  */
  constructor(options: ActionsSdkAppOptions);

  /*
  * Gets the request Conversation API version.
  *
  * @example
  * const app = new ActionsSdkApp({request: request, response: response});
  * const apiVersion = app.getApiVersion();
  *
  * @return {string} Version value or null if no value.
  */
  getApiVersion(): string;

  /**
   * Gets the user's raw input query.
   *
   * @example
   * const app = new ActionsSdkApp({request: request, response: response});
   * app.tell('You said ' + app.getRawInput());
   *
   * @return {string} User's raw query or null if no value.
   */
  getRawInput(): string;

  /**
   * Gets previous JSON dialog state that the app sent to Assistant.
   * Alternatively, use the app.data field to store JSON values between requests.
   *
   * @example
   * const app = new ActionsSdkApp({request: request, response: response});
   * const dialogState = app.getDialogState();
   *
   * @return {Object} JSON object provided to the Assistant in the previous
   *     user turn or {} if no value.
   */
  getDialogState(): object;

  /**
   * Gets the "versionLabel" specified inside the Action Package.
   * Used by app to do version control.
   *
   * @example
   * const app = new ActionsSdkApp({request: request, response: response});
   * const actionVersionLabel = app.getActionVersionLabel();
   *
   * @return {string} The specified version label or null if unspecified.
   */
  getActionVersionLabel(): string;

  /**
   * Gets the unique conversation ID. It's a new ID for the initial query,
   * and stays the same until the end of the conversation.
   *
   * @example
   * const app = new ActionsSdkApp({request: request, response: response});
   * const conversationId = app.getConversationId();
   *
   * @return {string} Conversation ID or null if no value.
   */
  getConversationId(): string;

  /**
   * Get the current intent. Alternatively, using a handler Map with
   * {@link AssistantApp#handleRequest|handleRequest}, the client library will
   * automatically handle the incoming intents.
   *
   * @example
   * const app = new ActionsSdkApp({request: request, response: response});
   *
   * function responseHandler (app) {
   *   const intent = app.getIntent();
   *   switch (intent) {
   *     case app.StandardIntents.MAIN:
   *       const inputPrompt = app.buildInputPrompt(false, 'Welcome to action snippets! Say anything.');
   *       app.ask(inputPrompt);
   *       break;
   *
   *     case app.StandardIntents.TEXT:
   *       app.tell('You said ' + app.getRawInput());
   *       break;
   *   }
   * }
   *
   * app.handleRequest(responseHandler);
   *
   * @return {string} Intent id or null if no value.
   */
  getIntent(): string;

  /**
   * Get the argument value by name from the current intent. If the argument
   * is not a text argument, the entire argument object is returned.
   *
   * Note: If incoming request is using an API version under 2 (e.g. 'v1'),
   * the argument object will be in Proto2 format (snake_case, etc).
   *
   * @param {string} argName Name of the argument.
   * @return {string} Argument value matching argName
   *     or null if no matching argument.
   */
  getArgument(argName: string): string;

  /**
   * Returns the option key user chose from options response.
   *
   * @example
   * const app = new App({request: req, response: res});
   *
   * function pickOption (app) {
   *   if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
   *     app.askWithCarousel('Which of these looks good?',
   *       app.buildCarousel().addItems(
   *         app.buildOptionItem('another_choice', ['Another choice']).
   *         setTitle('Another choice').setDescription('Choose me!')));
   *   } else {
   *     app.ask('What would you like?');
   *   }
   * }
   *
   * function optionPicked (app) {
   *   app.ask('You picked ' + app.getSelectedOption());
   * }
   *
   * const actionMap = new Map();
   * actionMap.set(app.StandardIntents.TEXT, pickOption);
   * actionMap.set(app.StandardIntents.OPTION, optionPicked);
   *
   * app.handleRequest(actionMap);
   *
   * @return {string} Option key of selected item. Null if no option selected or
   *     if current intent is not OPTION intent.
   */
  getSelectedOption(): string;

  /**
   * Asks to collect user's input; all user's queries need to be sent to
   * the app.
   * {@link https://developers.google.com/actions/policies/general-policies#user_experience|
   * The guidelines when prompting the user for a response must be followed at all times}.
   *
   * @example
   * const app = new ActionsSdkApp({request: request, response: response});
   *
   * function mainIntent (app) {
   *   const inputPrompt = app.buildInputPrompt(true, '<speak>Hi! <break time="1"/> ' +
   *         'I can read out an ordinal like ' +
   *         '<say-as interpret-as="ordinal">123</say-as>. Say a number.</speak>',
   *         ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
   *   app.ask(inputPrompt);
   * }
   *
   * function rawInput (app) {
   *   if (app.getRawInput() === 'bye') {
   *     app.tell('Goodbye!');
   *   } else {
   *     const inputPrompt = app.buildInputPrompt(true, '<speak>You said, <say-as interpret-as="ordinal">' +
   *       app.getRawInput() + '</say-as></speak>',
   *         ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
   *     app.ask(inputPrompt);
   *   }
   * }
   *
   * const actionMap = new Map();
   * actionMap.set(app.StandardIntents.MAIN, mainIntent);
   * actionMap.set(app.StandardIntents.TEXT, rawInput);
   *
   * app.handleRequest(actionMap);
   *
   * @param {Object|SimpleResponse|RichResponse} inputPrompt Holding initial and
   *     no-input prompts.
   * @param {Object=} dialogState JSON object the app uses to hold dialog state that
   *     will be circulated back by App.
   * @return The response that is sent to Assistant to ask user to provide input.
   */
  ask(inputPrompt: object | SimpleResponse | RichResponse, dialogState?: object): object;

  /**
   * Asks to collect user's input with a list.
   *
   * @example
   * const app = new ActionsSdkApp({request, response});
   *
   * function welcomeIntent (app) {
   *   app.askWithlist('Which of these looks good?',
   *     app.buildList('List title')
   *      .addItems([
   *        app.buildOptionItem(SELECTION_KEY_ONE,
   *          ['synonym of KEY_ONE 1', 'synonym of KEY_ONE 2'])
   *          .setTitle('Number one'),
   *        app.buildOptionItem(SELECTION_KEY_TWO,
   *          ['synonym of KEY_TWO 1', 'synonym of KEY_TWO 2'])
   *          .setTitle('Number two'),
   *      ]));
   * }
   *
   * function optionIntent (app) {
   *   if (app.getSelectedOption() === SELECTION_KEY_ONE) {
   *     app.tell('Number one is a great choice!');
   *   } else {
   *     app.tell('Number two is a great choice!');
   *   }
   * }
   *
   * const actionMap = new Map();
   * actionMap.set(app.StandardIntents.TEXT, welcomeIntent);
   * actionMap.set(app.StandardIntents.OPTION, optionIntent);
   * app.handleRequest(actionMap);
   *
   * @param {Object|SimpleResponse|RichResponse} inputPrompt Holding initial and
   *     no-input prompts. Cannot contain basic card.
   * @param {List} list List built with {@link AssistantApp#buildList|buildList}.
   * @param {Object=} dialogState JSON object the app uses to hold dialog state that
   *     will be circulated back by Assistant.
   * @return The response that is sent to Assistant to ask user to provide input.
   */
  askWithList(inputPrompt: object | SimpleResponse | RichResponse, list: List, dialogState?: object): object;

  /**
   * Asks user for delivery address.
   *
   * @example
   * const app = new ActionsSdkApp({request, response});
   * const WELCOME_INTENT = app.StandardIntents.MAIN;
   * const DELIVERY_INTENT = app.StandardIntents.DELIVERY_ADDRESS;
   *
   * function welcomeIntent (app) {
   *   app.askForDeliveryAddress('To make sure I can deliver to you');
   * }
   *
   * function addressIntent (app) {
   *   const postalCode = app.getDeliveryAddress().postalAddress.postalCode;
   *   if (isInDeliveryZone(postalCode)) {
   *     app.tell('Great looks like you\'re in our delivery area!');
   *   } else {
   *     app.tell('I\'m sorry it looks like we can\'t deliver to you.');
   *   }
   * }
   *
   * const actionMap = new Map();
   * actionMap.set(WELCOME_INTENT, welcomeIntent);
   * actionMap.set(DELIVERY_INTENT, addressIntent);
   * app.handleRequest(actionMap);
   *
   * @param {string} reason Reason given to user for asking delivery address.
   * @param {Object=} dialogState JSON object the app uses to hold dialog state that
   *     will be circulated back by Assistant.
   * @return {Object} HTTP response.
   */
  askForDeliveryAddress(reason: string, dialogState?: object): object;

  /**
   * Asks to collect user's input with a carousel.
   *
   * @example
   * const app = new ActionsSdkApp({request, response});
   *
   * function welcomeIntent (app) {
   *   app.askWithCarousel('Which of these looks good?',
   *     app.buildCarousel()
   *      .addItems([
   *        app.buildOptionItem(SELECTION_KEY_ONE,
   *          ['synonym of KEY_ONE 1', 'synonym of KEY_ONE 2'])
   *          .setTitle('Number one'),
   *        app.buildOptionItem(SELECTION_KEY_TWO,
   *          ['synonym of KEY_TWO 1', 'synonym of KEY_TWO 2'])
   *          .setTitle('Number two'),
   *      ]));
   * }
   *
   * function optionIntent (app) {
   *   if (app.getSelectedOption() === SELECTION_KEY_ONE) {
   *     app.tell('Number one is a great choice!');
   *   } else {
   *     app.tell('Number two is a great choice!');
   *   }
   * }
   *
   * const actionMap = new Map();
   * actionMap.set(app.StandardIntents.TEXT, welcomeIntent);
   * actionMap.set(app.StandardIntents.OPTION, optionIntent);
   * app.handleRequest(actionMap);
   *
   * @param {Object|SimpleResponse|RichResponse} inputPrompt Holding initial and
   *     no-input prompts. Cannot contain basic card.
   * @param {Carousel} carousel Carousel built with
   *      {@link AssistantApp#buildCarousel|buildCarousel}.
   * @param {Object=} dialogState JSON object the app uses to hold dialog state that
   *     will be circulated back by Assistant.
   * @return The response that is sent to Assistant to ask user to provide input.
   */
  askWithCarousel(inputPrompt: object | SimpleResponse | RichResponse, carousel: Carousel, dialogState?: object): object;

  /**
   * Tells Assistant to render the speech response and close the mic.
   *
   * @example
   * const app = new ActionsSdkApp({request: request, response: response});
   *
   * function mainIntent (app) {
   *   const inputPrompt = app.buildInputPrompt(true, '<speak>Hi! <break time="1"/> ' +
   *         'I can read out an ordinal like ' +
   *         '<say-as interpret-as="ordinal">123</say-as>. Say a number.</speak>',
   *         ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
   *   app.ask(inputPrompt);
   * }
   *
   * function rawInput (app) {
   *   if (app.getRawInput() === 'bye') {
   *     app.tell('Goodbye!');
   *   } else {
   *     const inputPrompt = app.buildInputPrompt(true, '<speak>You said, <say-as interpret-as="ordinal">' +
   *       app.getRawInput() + '</say-as></speak>',
   *         ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
   *     app.ask(inputPrompt);
   *   }
   * }
   *
   * const actionMap = new Map();
   * actionMap.set(app.StandardIntents.MAIN, mainIntent);
   * actionMap.set(app.StandardIntents.TEXT, rawInput);
   *
   * app.handleRequest(actionMap);
   *
   * @param {string|SimpleResponse|RichResponse} textToSpeech Final response.
   *     Spoken response can be SSML.
   * @return The HTTP response that is sent back to Assistant.
   */
  tell(textToSpeech: string | SimpleResponse | RichResponse): object;

  /**
   * Builds the {@link https://developers.google.com/actions/reference/conversation#InputPrompt|InputPrompt object}
   * from initial prompt and no-input prompts.
   *
   * The App needs one initial prompt to start the conversation. If there is no user response,
   * the App re-opens the mic and renders the no-input prompts three times
   * (one for each no-input prompt that was configured) to help the user
   * provide the right response.
   *
   * Note: we highly recommend app to provide all the prompts required here in order to ensure a
   * good user experience.
   *
   * @example
   * const inputPrompt = app.buildInputPrompt(false, 'Welcome to action snippets! Say a number.',
   *     ['Say any number', 'Pick a number', 'What is the number?']);
   * app.ask(inputPrompt);
   *
   * @param {boolean} isSsml Indicates whether the text to speech is SSML or not.
   * @param {string} initialPrompt The initial prompt the App asks the user.
   * @param {Array<string>=} noInputs Array of re-prompts when the user does not respond (max 3).
   * @return {Object} An {@link https://developers.google.com/actions/reference/conversation#InputPrompt|InputPrompt object}.
   */
  buildInputPrompt(isSsml: boolean, initialPrompt: string, noInputs: string[]): object;
}

export default ActionsSdkApp;
