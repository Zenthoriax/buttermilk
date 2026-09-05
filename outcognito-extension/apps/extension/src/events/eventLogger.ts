import {
  OutcognitoEvent,
  OutcognitoEventSchema,
} from "../../../../packages/event-schema/src/index";

export async function logValidatedEvent(
  rawData: unknown
): Promise<boolean> {

  const validationResult =
    OutcognitoEventSchema
      .safeParse(
        rawData
      );


  if (
    !validationResult.success
  ) {

    console.error(
      "[Event Logger] Schema validation failed:",
      validationResult
        .error
        .format()
    );

    return false;
  }


  const validEvent:
    OutcognitoEvent =
    validationResult.data;


  try {

    const storage =
      await chrome.storage.local.get({
        eventLog: [],
      });


    const currentEvents:
      OutcognitoEvent[] =
      storage.eventLog;


    // Avoid queue duplicates.
    if (
      currentEvents.some(
        event =>
          event.eventId ===
          validEvent.eventId
      )
    ) {

      return true;
    }


    currentEvents.push(
      validEvent
    );


    // Hackathon-safe queue limit.
    if (
      currentEvents.length >
      100
    ) {

      currentEvents.splice(
        0,
        currentEvents.length -
          100
      );
    }


    await chrome.storage.local.set({
      eventLog:
        currentEvents,
    });


    console.log(
      `[Event Logger] Queued ${validEvent.eventType}: ${validEvent.eventId}`
    );


    return true;

  } catch (
    error
  ) {

    console.error(
      "[Event Logger] Storage failure:",
      error
    );

    return false;
  }
}