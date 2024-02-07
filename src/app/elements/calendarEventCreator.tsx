import {CalendarEvent} from "@/app/model/eventData";
import React, {JSX, useContext, useEffect, useRef, useState} from "react";
import {DisplayContext, WindowController, WindowManager} from "@/app/utility/windowManager";
import {rollDate} from "@/app/utility/timeUtil";
import {Color} from "@/app/utility/color";
import {Theme} from "@/app/theme";
import {ColorList, ColorRow} from "@/app/elements/colorList";
import {TextInput} from "@/app/elements/inputs/textInput";
import {DateTimeSelector} from "@/app/elements/inputs/datetime/datetimeSelector";

import {PopupResult, RefClass, StateClass} from "@/app/elements/inputs/helper/inputHelper";
import moment from "moment";

function CalendarEventCreator(prop: {
    callback?: (result: PopupResult, data: any) => void,
    existingCE?: CalendarEvent
    pending?: boolean
}): JSX.Element {
    const {displayContextObj, updateContext} = useContext(DisplayContext)
    const hintRef = useRef<HTMLSpanElement>(null);

    const calendarEventRef = useRef(initCalendarEvent());

    // for this to work, you cannot assign a new data to it but change the value of the existing date object!
    const beginDTRef = useRef(calendarEventRef.current.begin);
    const endDTRef = useRef(calendarEventRef.current.end);

    const titleRef = useRef(calendarEventRef.current.title);
    const locationRef = useRef(calendarEventRef.current.location);
    const descriptionRef = useRef(calendarEventRef.current.description);

    // @ts-ignore
    const [colorState, setColorState] = useState(calendarEventRef.current.color ? Color.setColor(calendarEventRef.current.color._colorName) : Theme.defaultEventColor)

    function initCalendarEvent(): CalendarEvent {
        if (prop.existingCE) {
            return prop.existingCE
        }
        return new CalendarEvent({begin: new Date(), end: rollDate(new Date(), {hour: 1})})
    }

    function handleOutsideClick(wc: WindowController, event: React.MouseEvent) {
        event.stopPropagation()
        if (prop.callback) {
            prop.callback(PopupResult.Cancelled, undefined)
        }
        if (prop.pending) {
            displayContextObj.dataStoreUpdatedTime = new Date()
        }
    }

    function handleCreate(event: React.MouseEvent) {

        const calendarEvent = calendarEventRef.current

        calendarEvent.title = titleRef.current
        calendarEvent.description = descriptionRef.current
        calendarEvent.location = locationRef.current

        calendarEvent.color = colorState

        if (!(calendarEvent.begin && calendarEvent.end)) {
            console.log("begin or end does not exist!")
            return;
        }

        if (calendarEvent.begin.valueOf() >= calendarEvent.end.valueOf() && hintRef.current) {
            hint("End time is earlier than begin time.")
            console.log("begin: " + calendarEvent.begin)
            console.log("end: " + calendarEvent.end)
            return
        } else {
            hint()
        }

        const delta = moment.duration(calendarEvent.end.valueOf() - calendarEvent.begin.valueOf())
        if (delta.asWeeks() >= 1) {
            hint(`Duration too long (${delta.asDays().toFixed(1)} days), max duration is a week.`)
            return
        }

        displayContextObj.dataStore.update(calendarEvent)
        displayContextObj.dataStoreUpdatedTime = new Date()

        event.stopPropagation()
        if (prop.callback) {
            prop.callback(PopupResult.Success, null)
        }
    }

    function hint(text?: string) {
        if (text) {
            if (hintRef.current) {
                hintRef.current.innerText = text
            }
        } else {
            if (hintRef.current && hintRef.current.innerText != "") {
                hintRef.current.innerText = ""
            }
        }
    }

    function handleDelete(event: React.MouseEvent) {
        if (prop.existingCE) {
            displayContextObj.dataStore.deleteCe(prop.existingCE)
            displayContextObj.dataStoreUpdatedTime = new Date()
            event.stopPropagation()
            if (prop.callback) {
                prop.callback(PopupResult.Delete, null)
            }
        } else {
            closeThisWindow()
            return
        }
    }

    function closeThisWindow() {
        new WindowManager().getController('logCreator')?.closeWindow()
    }

    function handleColorSelection(color: Color) {
        const controller = windowManager.getController('colorList')
        controller?.closeWindow()
    }

    function handleColorSelectorClick(event: React.MouseEvent) {
        windowManager.createWindow({
            view:
                <div className={'p-2'}>
                    <ColorList handleSelection={handleColorSelection} parentData={new StateClass<Color>(colorState, setColorState)}/>
                </div>,
            key: 'colorList',
            rounded: true,
            handleOutSideClick: (wc: WindowController) => wc.closeWindow(),
            header: true
        })
    }

    const windowManager = new WindowManager()
    windowManager.setOnOutsideClick('logCreator', handleOutsideClick)

    const isNewCalendarEvent = !prop.existingCE || prop.pending

    return (
        <div
            className={'w-fit p-3 bg-cyan-50 cursor-default flex-col inline-flex gap-3'}
        >
            <TextInput placeholder={"Add title"} parentData={new RefClass(titleRef)}/>
            <span className={'whitespace-nowrap'}>
                    Begin:
                <DateTimeSelector
                    parentData={new RefClass(beginDTRef)}
                    default={beginDTRef.current}
                />
                </span>
            <br/>
            <span className={'whitespace-nowrap'}>
                    End:
                    <DateTimeSelector
                        parentData={new RefClass(endDTRef)}
                        default={endDTRef.current}
                    />
                </span>
            <span ref={hintRef} className={'text-red-600 text-sm'}></span>

            <div onClick={handleColorSelectorClick}>
                <ColorRow color={colorState} label={colorState.colorName}/>
            </div>

            <TextInput placeholder={"Add location"} parentData={new RefClass(locationRef)}/>
            <TextInput placeholder={"Add description"} parentData={new RefClass(descriptionRef)}/>

            <div className={'mt-auto flex-row inline-flex'}>
                <button className={`${Theme.button} w-fit self-start`} onClick={handleDelete}>{!isNewCalendarEvent ? "Delete" : "Cancel"}</button>
                {!isNewCalendarEvent ? <button className={`${Theme.button}`} onClick={closeThisWindow}>Cancel</button> : undefined}
                <button className={`${Theme.button} w-fit self-end ml-auto`}
                        onClick={handleCreate}>{!isNewCalendarEvent ? "Update" : "Create"}</button>
            </div>
        </div>
    )
}

export function CalendarEventCreatorWrapper(prop: {
    existingCE?: CalendarEvent,
    pending?: boolean
}): JSX.Element {
    const [showSelf, setShowSelf] = useState(true)
    const controller = useRef<WindowController>();
    const windowManager = new WindowManager()
    useEffect(() => {
        if (prop.pending) {
            createWindow()
        }
    });

    function handleOnClick(event: React.MouseEvent) {
        createWindow()
        event.stopPropagation()
    }

    function handleCallback(result: PopupResult, data: any) {
        if (result == PopupResult.Cancelled) {
            closeWindow()
        } else if (result == PopupResult.Success) {
            closeWindow()
        } else if (result == PopupResult.Delete) {
            closeWindow()
        }
    }

    function closeWindow() {
        controller.current?.closeWindow()
    }

    function createWindow() {
        controller.current = windowManager.createWindow({
            view: <CalendarEventCreator callback={handleCallback} existingCE={prop.existingCE}
                                        pending={prop.pending}/>,
            key: 'logCreator',
            rounded: true,
            header: true
        })
    }

    return (
        <div>
            {showSelf && (
                <div className={'absolute hover:cursor-pointer w-full h-full z-10 top-0 left-0'}
                     onClick={handleOnClick}>
                </div>
            )}
        </div>
    )
}