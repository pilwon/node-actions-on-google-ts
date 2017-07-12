import { Request, Response } from 'express';

import { BasicCard, Carousel, List, OptionItem, RichResponse } from './response-builder';
import { ActionPaymentTransactionConfig, Cart, GooglePaymentTransactionConfig,
         LineItem, Order, OrderUpdate, TransactionValues } from './transactions';

/**
 * The Actions on Google client library AssistantApp base class.
 *
 * This class contains the methods that are shared between platforms to support the conversation API
 * protocol from Assistant. It also exports the 'State' class as a helper to represent states by
 * name.
 */

/**
 * User provided date/time info.
 * @typedef {Object} DateTime
 * @property {Object} date
 * @property {number} date.year
 * @property {number} date.month
 * @property {number} date.day
 * @property {Object} time
 * @property {number} time.hours
 * @property {number} time.minutes
 * @property {number} time.seconds
 * @property {number} time.nanos
 */
export interface DateTime {
  date: {
    year: number;
    month: number;
    day: number;
  };
  time: {
    hours: number;
    minutes: number;
    seconds: number;
    nanos: number;
  };
}

/**
 * User's permissioned name info.
 * @typedef {Object} UserName
 * @property {string} displayName - User's display name.
 * @property {string} givenName - User's given name.
 * @property {string} familyName - User's family name.
 */
export interface UserName {
  // User's display name.
  displayName: string;
  // User's given name.
  givenName: string;
  // User's family name.
  familyName: string;
}

/**
 * User's permissioned device location.
 */
export interface DeviceLocation {
  // {latitude, longitude}. Requested with SupportedPermissions.DEVICE_PRECISE_LOCATION.
  coordinates: object;
  // Full, formatted street address. Requested with SupportedPermissions.DEVICE_PRECISE_LOCATION.
  address: string;
  // Zip code. Requested with SupportedPermissions.DEVICE_COARSE_LOCATION.
  zipCode: string;
  // Device city. Requested with SupportedPermissions.DEVICE_COARSE_LOCATION.
  city: string;
}

/**
 * User object.
 * @typedef {Object} User
 * @property {string} userId - Random string ID for Google user.
 * @property {UserName} userName - User name information. Null if not
 *     requested with {@link AssistantApp#askForPermission|askForPermission(SupportedPermissions.NAME)}.
 * @property {string} accessToken - Unique Oauth2 token. Only available with
 *     account linking.
 */
export interface User {
  // Random string ID for Google user.
  userId: string;
  // User name information. Null if not requested with {@link AssistantApp#askForPermission|askForPermission(SupportedPermissions.NAME)}.
  userName: UserName;
  // Unique Oauth2 token. Only available with account linking.
  accessToken: string;
}

export class AssistantApp {
  /**
   * The session state.
   */
  readonly state: string;

  /**
   * The session data in JSON format.
   */
  readonly data: object;

  /**
   * List of standard intents that the app provides.
   * @enum {string}
   * @actionssdk
   * @apiai
   */
  readonly StandardIntents: {
    /** App fires MAIN intent for queries like [talk to $app]. */
    MAIN: 'actions.intent.MAIN' | 'assistant.intent.action.MAIN',
    /** App fires TEXT intent when action issues ask intent. */
    TEXT: 'actions.intent.TEXT' | 'assistant.intent.action.TEXT',
    /** App fires PERMISSION intent when action invokes askForPermission. */
    PERMISSION: 'actions.intent.PERMISSION' | 'assistant.intent.action.PERMISSION',
    /** App fires OPTION intent when user chooses from options provided. */
    OPTION: 'actions.intent.OPTION',
    /** App fires TRANSACTION_REQUIREMENTS_CHECK intent when action sets up transaction. */
    TRANSACTION_REQUIREMENTS_CHECK: 'actions.intent.TRANSACTION_REQUIREMENTS_CHECK',
    /** App fires DELIVERY_ADDRESS intent when action asks for delivery address. */
    DELIVERY_ADDRESS: 'actions.intent.DELIVERY_ADDRESS',
    /** App fires TRANSACTION_DECISION intent when action asks for transaction decision. */
    TRANSACTION_DECISION: 'actions.intent.TRANSACTION_DECISION',
    /** App fires CONFIRMATION intent when requesting affirmation from user. */
    CONFIRMATION: 'actions.intent.CONFIRMATION',
    /** App fires DATETIME intent when requesting date/time from user. */
    DATETIME: 'actions.intent.DATETIME',
    /** App fires SIGN_IN intent when requesting sign-in from user. */
    SIGN_IN: 'actions.intent.SIGN_IN',
  };

  /**
   * List of supported permissions the app supports.
   * @enum {string}
   * @actionssdk
   * @apiai
   */
  readonly SupportedPermissions: {
    /**
     * The user's name as defined in the
     * {@link https://developers.google.com/actions/reference/conversation#UserProfile|UserProfile object}
     */
    NAME: 'NAME',
    /**
     * The location of the user's current device, as defined in the
     * {@link https://developers.google.com/actions/reference/conversation#Location|Location object}.
     */
    DEVICE_PRECISE_LOCATION: 'DEVICE_PRECISE_LOCATION',
    /**
     * City and zipcode corresponding to the location of the user's current device, as defined in the
     * {@link https://developers.google.com/actions/reference/conversation#Location|Location object}.
     */
    DEVICE_COARSE_LOCATION: 'DEVICE_COARSE_LOCATION',
  };

  /**
   * List of built-in argument names.
   * @enum {string}
   * @actionssdk
   * @apiai
   */
  readonly BuiltInArgNames: {
    /** Permission granted argument. */
    PERMISSION_GRANTED: 'PERMISSION' | 'permission_granted',
    /** Option selected argument. */
    OPTION: 'OPTION',
    /** Transaction requirements check result argument. */
    TRANSACTION_REQ_CHECK_RESULT: 'TRANSACTION_REQUIREMENTS_CHECK_RESULT',
    /** Delivery address value argument. */
    DELIVERY_ADDRESS_VALUE: 'DELIVERY_ADDRESS_VALUE',
    /** Transactions decision argument. */
    TRANSACTION_DECISION_VALUE: 'TRANSACTION_DECISION_VALUE',
    /** Confirmation argument. */
    CONFIRMATION: 'CONFIRMATION',
    /** DateTime argument. */
    DATETIME: 'DATETIME',
    /** Sign in status argument. */
    SIGN_IN: 'SIGN_IN',
  };

  /**
   * List of possible conversation stages, as defined in the
   * {@link https://developers.google.com/actions/reference/conversation#Conversation|Conversation object}.
   * @enum {number}
   * @actionssdk
   * @apiai
   */
  readonly ConversationStages: {
    /**
     * Unspecified conversation state.
     */
    UNSPECIFIED: 'UNSPECIFIED' | 0,
    /**
     * A new conversation.
     */
    NEW: 'NEW' | 1,
    /**
     * An active (ongoing) conversation.
     */
    ACTIVE: 'ACTIVE' | 2,
  };

  /**
   * List of surface capabilities supported by the app.
   * @enum {string}
   * @actionssdk
   * @apiai
   */
  readonly SurfaceCapabilities: {
    /**
     * The ability to output audio.
     */
    AUDIO_OUTPUT: 'actions.capability.AUDIO_OUTPUT',
    /**
     * The ability to output on a screen
     */
    SCREEN_OUTPUT: 'actions.capability.SCREEN_OUTPUT',
  };

  /**
   * List of possible user input types.
   * @enum {number}
   * @actionssdk
   * @apiai
   */
  readonly InputTypes: {
    /**
     * Unspecified.
     */
    UNSPECIFIED: 'UNSPECIFIED' | 0,
    /**
     * Input given by touch.
     */
    TOUCH: 'TOUCH' | 1,
    /**
     * Input given by voice (spoken).
     */
    VOICE: 'VOICE' | 2,
    /**
     * Input given by keyboard (typed).
     */
    KEYBOARD: 'KEYBOARD' | 3,
  };

  /**
   * List of possible sign in result status values.
   * @enum {string}
   * @actionssdk
   * @apiai
   */
  readonly SignInStatus: {
    // Unknown status.
    UNSPECIFIED: 'SIGN_IN_STATUS_UNSPECIFIED',
    // User successfully completed the account linking.
    OK: 'OK',
    // Cancelled or dismissed account linking.
    CANCELLED: 'CANCELLED',
    // System or network error.
    ERROR: 'ERROR',
  };

  /**
   * Values related to supporting {@link Transactions}.
   * @type {object}
   */
  readonly Transactions: typeof TransactionValues;

  /**
   * Constructor for AssistantApp object.
   * Should not be instantiated; rather instantiate one of the subclasses
   * {@link ActionsSdkApp} or {@link ApiAiApp}.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.request Express HTTP request object.
   * @param {Object} options.response Express HTTP response object.
   * @param {Function=} options.sessionStarted Function callback when session starts.
   */
  constructor(options: {request: Request, response: Response, sessionStarted?: Function});

  // ---------------------------------------------------------------------------
  //                   Public APIs
  // ---------------------------------------------------------------------------

  /**
   * Handles the incoming Assistant request using a handler or Map of handlers.
   * Each handler can be a function callback or Promise.
   *
   * @example
   * // Actions SDK
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
   * // API.AI
   * const app = new ApiAIApp({request: req, response: res});
   * const NAME_ACTION = 'make_name';
   * const COLOR_ARGUMENT = 'color';
   * const NUMBER_ARGUMENT = 'number';
   *
   * function makeName (app) {
   *   const number = app.getArgument(NUMBER_ARGUMENT);
   *   const color = app.getArgument(COLOR_ARGUMENT);
   *   app.tell('Alright, your silly name is ' +
   *     color + ' ' + number +
   *     '! I hope you like it. See you next time.');
   * }
   *
   * const actionMap = new Map();
   * actionMap.set(NAME_ACTION, makeName);
   * app.handleRequest(actionMap);
   *
   * @param {(Function|Map)} handler The handler (or Map of handlers) for the request.
   * @actionssdk
   * @apiai
   */
  handleRequest(handler: Function | Map<string, Function>): void;

  /**
   * Equivalent to {@link AssistantApp#askForPermission|askForPermission},
   * but allows you to prompt the user for more than one permission at once.
   *
   * Notes:
   *
   * * The order in which you specify the permission prompts does not matter -
   *   it is controlled by the Assistant to provide a consistent user experience.
   * * The user will be able to either accept all permissions at once, or none.
   *   If you wish to allow them to selectively accept one or other, make several
   *   dialog turns asking for each permission independently with askForPermission.
   * * Asking for DEVICE_COARSE_LOCATION and DEVICE_PRECISE_LOCATION at once is
   *   equivalent to just asking for DEVICE_PRECISE_LOCATION
   *
   * @example
   * const app = new ApiAIApp({request: req, response: res});
   * const REQUEST_PERMISSION_ACTION = 'request_permission';
   * const GET_RIDE_ACTION = 'get_ride';
   *
   * function requestPermission (app) {
   *   const permission = [
   *     app.SupportedPermissions.NAME,
   *     app.SupportedPermissions.DEVICE_PRECISE_LOCATION
   *   ];
   *   app.askForPermissions('To pick you up', permissions);
   * }
   *
   * function sendRide (app) {
   *   if (app.isPermissionGranted()) {
   *     const displayName = app.getUserName().displayName;
   *     const address = app.getDeviceLocation().address;
   *     app.tell('I will tell your driver to pick up ' + displayName +
   *         ' at ' + address);
   *   } else {
   *     // Response shows that user did not grant permission
   *     app.tell('Sorry, I could not figure out where to pick you up.');
   *   }
   * }
   * const actionMap = new Map();
   * actionMap.set(REQUEST_PERMISSION_ACTION, requestPermission);
   * actionMap.set(GET_RIDE_ACTION, sendRide);
   * app.handleRequest(actionMap);
   *
   * @param {string} context Context why the permission is being asked; it's the TTS
   *     prompt prefix (action phrase) we ask the user.
   * @param {Array<string>} permissions Array of permissions App supports, each of
   *     which comes from AssistantApp.SupportedPermissions.
   * @param {Object=} dialogState JSON object the app uses to hold dialog state that
   *     will be circulated back by Assistant. Used in {@link ActionsSdkAssistant}.
   * @return A response is sent to Assistant to ask for the user's permission; for any
   *     invalid input, we return null.
   * @actionssdk
   * @apiai
   */
  askForPermissions(context: string, permissions: string[], dialogState?: object): object;

  /**
   * Checks whether user is in transactable state.
   *
   * @example
   * const app = new ApiAiApp({request: request, response: response});
   * const WELCOME_INTENT = 'input.welcome';
   * const TXN_REQ_COMPLETE = 'txn.req.complete';
   *
   * let transactionConfig = {
   *     deliveryAddressRequired: false,
   *     type: app.Transactions.PaymentType.BANK,
   *     displayName: 'Checking-1234'
   * };
   * function welcomeIntent (app) {
   *   app.askForTransactionRequirements(transactionConfig);
   * }
   *
   * function txnReqCheck (app) {
   *   if (app.getTransactionRequirementsResult() === app.Transactions.ResultType.OK) {
   *     // continue cart building flow
   *   } else {
   *     // don't continue cart building
   *   }
   * }
   *
   * const actionMap = new Map();
   * actionMap.set(WELCOME_INTENT, welcomeIntent);
   * actionMap.set(TXN_REQ_COMPLETE, txnReqCheck);
   * app.handleRequest(actionMap);
   *
   * @param {ActionPaymentTransactionConfig|GooglePaymentTransactionConfig=}
   *     transactionConfig Configuration for the transaction. Includes payment
   *     options and order options. Optional if order has no payment or
   *     delivery.
   * @param {Object=} dialogState JSON object the app uses to hold dialog state that
   *     will be circulated back by Assistant. Used in {@link ActionsSdkAssistant}.
   * @return {Object} HTTP response.
   * @actionssdk
   * @apiai
   */
  askForTransactionRequirements(transactionConfig?: ActionPaymentTransactionConfig | GooglePaymentTransactionConfig, dialogState?: object): object;

  /**
   * Asks user to confirm transaction information.
   *
   * @example
   * const app = new ApiAiApp({request: request, response: response});
   * const WELCOME_INTENT = 'input.welcome';
   * const TXN_COMPLETE = 'txn.complete';
   *
   * let transactionConfig = {
   *     deliveryAddressRequired: false,
   *     type: app.Transactions.PaymentType.BANK,
   *     displayName: 'Checking-1234'
   * };
   *
   * let order = app.buildOrder();
   * // fill order cart
   *
   * function welcomeIntent (app) {
   *   app.askForTransactionDecision(order, transactionConfig);
   * }
   *
   * function txnComplete (app) {
   *   // respond with order update
   * }
   *
   * const actionMap = new Map();
   * actionMap.set(WELCOME_INTENT, welcomeIntent);
   * actionMap.set(TXN_COMPLETE, txnComplete);
   * app.handleRequest(actionMap);
   *
   * @param {Object} order Order built with buildOrder().
   * @param {ActionPaymentTransactionConfig|GooglePaymentTransactionConfig}
   *     transactionConfig Configuration for the transaction. Includes payment
   *     options and order options.
   * @param {Object=} dialogState JSON object the app uses to hold dialog state that
   *     will be circulated back by Assistant. Used in {@link ActionsSdkAssistant}.
   * @apiai
   */
  askForTransactionDecision(order: object, transactionConfig?: ActionPaymentTransactionConfig | GooglePaymentTransactionConfig, dialogState?: object): object;

  /**
   * Asks the Assistant to guide the user to grant a permission. For example,
   * if you want your app to get access to the user's name, you would invoke
   * the askForPermission method with a context containing the reason for the request,
   * and the AssistantApp.SupportedPermissions.NAME permission. With this, the Assistant will ask
   * the user, in your agent's voice, the following: '[Context with reason for the request],
   * I'll just need to get your name from Google, is that OK?'.
   *
   * Once the user accepts or denies the request, the Assistant will fire another intent:
   * assistant.intent.action.PERMISSION with a boolean argument: AssistantApp.BuiltInArgNames.PERMISSION_GRANTED
   * and, if granted, the information that you requested.
   *
   * Read more:
   *
   * * {@link https://developers.google.com/actions/reference/conversation#ExpectedIntent|Supported Permissions}
   * * Check if the permission has been granted with {@link ActionsSdkApp#isPermissionGranted|isPermissionsGranted}
   * * {@link ActionsSdkApp#getDeviceLocation|getDeviceLocation}
   * * {@link AssistantApp#getUserName|getUserName}
   *
   * @example
   * const app = new ApiAiApp({request: req, response: res});
   * const REQUEST_PERMISSION_ACTION = 'request_permission';
   * const GET_RIDE_ACTION = 'get_ride';
   *
   * function requestPermission (app) {
   *   const permission = app.SupportedPermissions.NAME;
   *   app.askForPermission('To pick you up', permission);
   * }
   *
   * function sendRide (app) {
   *   if (app.isPermissionGranted()) {
   *     const displayName = app.getUserName().displayName;
   *     app.tell('I will tell your driver to pick up ' + displayName);
   *   } else {
   *     // Response shows that user did not grant permission
   *     app.tell('Sorry, I could not figure out who to pick up.');
   *   }
   * }
   * const actionMap = new Map();
   * actionMap.set(REQUEST_PERMISSION_ACTION, requestPermission);
   * actionMap.set(GET_RIDE_ACTION, sendRide);
   * app.handleRequest(actionMap);
   *
   * @param {string} context Context why permission is asked; it's the TTS
   *     prompt prefix (action phrase) we ask the user.
   * @param {string} permission One of the permissions Assistant supports, each of
   *     which comes from AssistantApp.SupportedPermissions.
   * @param {Object=} dialogState JSON object the app uses to hold dialog state that
   *     will be circulated back by Assistant.
   * @return A response is sent to the Assistant to ask for the user's permission;
   *     for any invalid input, we return null.
   * @actionssdk
   * @apiai
   */
  askForPermission(context: string, permission: string, dialogState?: object): object;

  /**
   * Asks user for a confirmation.
   *
   * @example
   * const app = new ApiAiApp({ request, response });
   * const WELCOME_INTENT = 'input.welcome';
   * const CONFIRMATION = 'confirmation';
   *
   * function welcomeIntent (app) {
   *   app.askForConfirmation('Are you sure you want to do that?');
   * }
   *
   * function confirmation (app) {
   *   if (app.getUserConfirmation()) {
   *     app.tell('Great! I\'m glad you want to do it!');
   *   } else {
   *     app.tell('That\'s okay. Let\'s not do it now.');
   *   }
   * }
   *
   * const actionMap = new Map();
   * actionMap.set(WELCOME_INTENT, welcomeIntent);
   * actionMap.set(CONFIRMATION, confirmation);
   * app.handleRequest(actionMap);
   *
   * @param {string=} prompt The confirmation prompt presented to the user to
   *     query for an affirmative or negative response. If undefined or null,
   *     Google will use a generic yes/no prompt.
   * @param {Object=} dialogState JSON object the app uses to hold dialog state that
   *     will be circulated back by Assistant. Used in {@link ActionsSdkAssistant}.
   * @actionssdk
   * @apiai
   */
  askForConfirmation(prompt?: string, dialogState?: object): object;

  /**
   * Asks user for a timezone-agnostic date and time.
   *
   * @example
   * const app = new ApiAiApp({ request, response });
   * const WELCOME_INTENT = 'input.welcome';
   * const DATETIME = 'datetime';
   *
   * function welcomeIntent (app) {
   *   app.askForDateTime('When do you want to come in?',
   *     'Which date works best for you?',
   *     'What time of day works best for you?');
   * }
   *
   * function datetime (app) {
   *   app.tell({speech: 'Great see you at your appointment!',
   *     displayText: 'Great, we will see you on '
   *     + app.getDateTime().date.month
   *     + '/' + app.getDateTime().date.day
   *     + ' at ' + app.getDateTime().time.hours
   *     + (app.getDateTime().time.minutes || '')});
   * }
   *
   * const actionMap = new Map();
   * actionMap.set(WELCOME_INTENT, welcomeIntent);
   * actionMap.set(DATETIME, datetime);
   * app.handleRequest(actionMap);
   *
   * @param {string=} initialPrompt The initial prompt used to ask for a
   *     date and time. If undefined or null, Google will use a generic
   *     prompt.
   * @param {string=} datePrompt The prompt used to specifically ask for the
   *     date if not provided by user. If undefined or null, Google will use a
   *     generic prompt.
   * @param {string=} timePrompt The prompt used to specifically ask for the
   *     time if not provided by user. If undefined or null, Google will use a
   *     generic prompt.
   * @param {Object=} dialogState JSON object the app uses to hold dialog state that
   *     will be circulated back by Assistant. Used in {@link ActionsSdkAssistant}.
   * @actionssdk
   * @apiai
   */
  askForDateTime(initialPrompt?: string, datePrompt?: string, timePrompt?: string, dialogState?: object): object;

  /**
   * Asks user for a timezone-agnostic date and time.
   *
   * @example
   * const app = new ApiAiApp({ request, response });
   * const WELCOME_INTENT = 'input.welcome';
   * const SIGN_IN = 'sign.in';
   *
   * function welcomeIntent (app) {
   *   app.askForSignIn();
   * }
   *
   * function signIn (app) {
   *   if (app.getSignInStatus() === app.SignInstatus.OK) {
   *     let accessToken = app.getUser().accessToken;
   *     app.ask('Great, thanks for signing in!');
   *   } else {
   *     app.ask('I won\'t be able to save your data, but let\'s continue!');
   *   }
   * }
   *
   * const actionMap = new Map();
   * actionMap.set(WELCOME_INTENT, welcomeIntent);
   * actionMap.set(SIGN_IN, signIn);
   * app.handleRequest(actionMap);
   *
   * @param {Object=} dialogState JSON object the app uses to hold dialog state that
   *     will be circulated back by Assistant. Used in {@link ActionsSdkAssistant}.
   * @actionssdk
   * @apiai
   */
  askForSignIn(dialogState?: object): object;

  /**
   * If granted permission to user's name in previous intent, returns user's
   * display name, family name, and given name. If name info is unavailable,
   * returns null.
   *
   * @example
   * const app = new ApiAIApp({request: req, response: res});
   * const REQUEST_PERMISSION_ACTION = 'request_permission';
   * const SAY_NAME_ACTION = 'get_name';
   *
   * function requestPermission (app) {
   *   const permission = app.SupportedPermissions.NAME;
   *   app.askForPermission('To know who you are', permission);
   * }
   *
   * function sayName (app) {
   *   if (app.isPermissionGranted()) {
   *     app.tell('Your name is ' + app.getUserName().displayName));
   *   } else {
   *     // Response shows that user did not grant permission
   *     app.tell('Sorry, I could not get your name.');
   *   }
   * }
   * const actionMap = new Map();
   * actionMap.set(REQUEST_PERMISSION_ACTION, requestPermission);
   * actionMap.set(SAY_NAME_ACTION, sayName);
   * app.handleRequest(actionMap);
   * @return {UserName} Null if name permission is not granted.
   * @actionssdk
   * @apiai
   */
  getUserName(): string;

  /**
   * Returns true if user device has a given surface capability.
   *
   * @param {string} capability Must be one of {@link SurfaceCapabilities}.
   * @return {boolean} True if user device has the given capability.
   *
   * @example
   * const app = new ApiAIApp({request: req, response: res});
   * const DESCRIBE_SOMETHING = 'DESCRIBE_SOMETHING';
   *
   * function describe (app) {
   *   if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
   *     app.tell(richResponseWithBasicCard);
   *   } else {
   *     app.tell('Let me tell you about ...');
   *   }
   * }
   * const actionMap = new Map();
   * actionMap.set(DESCRIBE_SOMETHING, describe);
   * app.handleRequest(actionMap);
   *
   * @apiai
   * @actionssdk
   */
  hasSurfaceCapability(requestedCapability: string): boolean;

  /**
   * Gets surface capabilities of user device.
   *
   * Implemented in subclasses for Actions SDK and API.AI.
   * @return {Object} HTTP response.
   * @apiai
   * @actionssdk
   */
  getSurfaceCapabilities(): object;

  // ---------------------------------------------------------------------------
  //                   Response Builders
  // ---------------------------------------------------------------------------

  /**
   * Constructs RichResponse with chainable property setters.
   *
   * @param {RichResponse=} richResponse RichResponse to clone.
   * @return {RichResponse} Constructed RichResponse.
   */
  buildRichResponse(richResponse?: RichResponse): RichResponse;

  /**
   * Constructs BasicCard with chainable property setters.
   *
   * @param {string=} bodyText Body text of the card. Can be set using setTitle
   *     instead.
   * @return {BasicCard} Constructed BasicCard.
   */
  buildBasicCard(bodyText?: string): BasicCard;

  /**
   * Constructs List with chainable property setters.
   *
   * @param {string=} title A title to set for a new List.
   * @return {List} Constructed List.
   */
  buildList(title?: string): List;

  /**
   * Constructs Carousel with chainable property setters.
   *
   * @return {Carousel} Constructed Carousel.
   */
  buildCarousel(): Carousel;

  /**
   * Constructs OptionItem with chainable property setters.
   *
   * @param {string=} key A unique key to identify this option. This key will
   *     be returned as an argument in the resulting actions.intent.OPTION
   *     intent.
   * @param {string|Array<string>=} synonyms A list of synonyms which the user may
   *     use to identify this option instead of the option key.
   * @return {OptionItem} Constructed OptionItem.
   */
  buildOptionItem(key?: string, synonyms?: string | string[]): OptionItem;

  // ---------------------------------------------------------------------------
  //                   Transaction Builders
  // ---------------------------------------------------------------------------

  /**
   * Constructs Order with chainable property setters.
   *
   * @param {string} orderId Unique identifier for the order.
   * @return {Order} Constructed Order.
   */
  buildOrder(orderId: string): Order;

  /**
   * Constructs Cart with chainable property setters.
   *
   * @param {string=} cartId Unique identifier for the cart.
   * @return {Cart} Constructed Cart.
   */
  buildCart(cartId?: string): Cart;

  /**
   * Constructs LineItem with chainable property setters.
   *
   * @param {string} id Unique identifier for the item.
   * @param {string} name Name of the line item.
   * @return {LineItem} Constructed LineItem.
   */
  buildLineItem(id: string, name: string): LineItem;

  /**
   * Constructs OrderUpdate with chainable property setters.
   *
   * @param {string} orderId Unique identifier of the order.
   * @param {boolean} isGoogleOrderId True if the order ID is provided by
   *     Google. False if the order ID is app provided.
   * @return {OrderUpdate} Constructed OrderUpdate.
   */
  buildOrderUpdate(orderId: string, isGoogleOrderId: boolean): OrderUpdate;
}

export class State {
  constructor(name: string);
  getName(): string;
}

export default {
  AssistantApp,
  State,
};