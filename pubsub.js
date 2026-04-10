/**
 * ============================================================
 *  pubsub.js  — Publisher/Subscriber Pattern
 *  Prompt 8: Modules & Design Patterns
 * ============================================================
 */

'use strict';

/**
 * PubSub (Event Bus)
 * A central hub that allows different parts of the application
 * to communicate without knowing about each other.
 *
 * Example:
 *   PubSub.subscribe('TOPIC', (data) => console.log(data));
 *   PubSub.publish('TOPIC', { info: 'hello' });
 */
const PubSub = (() => {
  const events = {};

  return {
    /**
     * @param {string} eventName
     * @param {function} fn
     */
    subscribe(eventName, fn) {
      events[eventName] = events[eventName] || [];
      events[eventName].push(fn);
    },

    /**
     * @param {string} eventName
     * @param {any} data
     */
    publish(eventName, data) {
      if (events[eventName]) {
        events[eventName].forEach(fn => fn(data));
      }
    },

    /**
     * @param {string} eventName
     * @param {function} fn
     */
    unsubscribe(eventName, fn) {
      if (events[eventName]) {
        events[eventName] = events[eventName].filter(f => f !== fn);
      }
    }
  };
})();

export default PubSub;
