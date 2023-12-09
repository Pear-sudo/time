import {CalendarEvent} from "@/app/model/eventData";
import React, {JSX, useContext, useEffect, useRef, useState} from "react";
import {DisplayContext, WindowController, WindowManager} from "@/app/utility/windowManager";
import {date2Day, date2Time, Day, dayKeys, Time, timeKeys} from "@/app/utility/timeUtil";
import {Color} from "@/app/utility/color";
import {Theme} from "@/app/theme";
import {initObject} from "@/app/utility/lanUtil";
import {ColorList, ColorRow} from "@/app/elements/colorList";
import {TextInput} from "@/app/elements/inputs/textInput";
import {DateSelector, TimeSelector} from "@/app/elements/inputs/datetimeSelector";

import {PopupResult, PropWrapper, RefClass} from "@/app/elements/inputs/helper/inputHelper";

// TODO there is a bug here: set title, then set color, title would disappear in the newly created event
function CalendarEventCreator(prop: {
    callback?: (result: PopupResult, data: any) => void,
    submitButtonName?: string,
    existingCE?: PropWrapper<CalendarEvent>
    pending?: boolean
}): JSX.Element {
    const {displayContextObj, updateContext} = useContext(DisplayContext)
    const hintRef = useRef<HTMLSpanElement>(null);

    const calendarEventRef = useRef(new CalendarEvent());

    const beginTimeRef = useRef<Time>();
    const endTimeRef = useRef<Time>();

    const beginDayRef = useRef<Day>();
    const endDayRef = useRef<Day>();

    const titleRef = useRef("(No title)");
    const locationRef = useRef("");
    const descriptionRef = useRef("");

    // @ts-ignore
    const colorRef = useRef(prop.existingCE?.prop.color ? Color.setColor(prop.existingCE?.prop.color._colorName) : Theme.defaultEventColor);

    const submitButtonName = prop.submitButtonName ? prop.submitButtonName : "Create"

    function extractExistingCE() {
        if (prop.existingCE) {
            const existingCE = prop.existingCE.prop

            titleRef.current = existingCE.title
            locationRef.current = existingCE.location
            descriptionRef.current = existingCE.description

            beginDayRef.current = date2Day(existingCE.begin)
            endDayRef.current = date2Day(existingCE.end)

            beginTimeRef.current = date2Time(existingCE.begin)
            endTimeRef.current = date2Time(existingCE.end)
        }
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

    function handleTimeSelectorCallback(ref: React.MutableRefObject<Time | undefined>) {
        return (
            (time: Time) => {
                ref.current = time
            }
        )
    }

    function handleDaySelectorCallback(ref: React.MutableRefObject<Day | undefined>) {
        return (
            (day: Day) => {
                ref.current = day
            }
        )
    }

    // TODO refactor this function, use only one reference, that is, one calendar event, and delegate the setting logic to each click function
    function handleCreate(event: React.MouseEvent) {
        let reportingBeginTime = beginTimeRef.current ? initObject(timeKeys, beginTimeRef.current, 0) : initObject(timeKeys, {} as Time, 0)
        const reportingEndTime = endTimeRef.current ? initObject(timeKeys, endTimeRef.current, 0) : initObject(timeKeys, {} as Time, 0)

        const reportingBeginDate = new Date(new Date().setHours(reportingBeginTime.hour, reportingBeginTime.minute, 0, 0))
        const reportingEndDate = new Date(new Date().setHours(reportingEndTime?.hour, reportingEndTime?.minute, 0, 0))

        if (beginDayRef.current && endDayRef.current) {
            const beginDay = initObject(dayKeys, beginDayRef.current, 0)
            const endDay = initObject(dayKeys, endDayRef.current, 0)
            reportingBeginDate.setFullYear(beginDay?.year, beginDay?.month, beginDay?.date)
            reportingEndDate.setFullYear(endDay?.year, endDay?.month, endDay?.date)
        }

        if (reportingBeginDate.valueOf() >= reportingEndDate.valueOf() && hintRef.current) {
            hintRef.current.innerText = "End time is earlier than begin time."
            console.log(reportingBeginDate)
            console.log(reportingEndDate)
            return
        } else if (hintRef.current && hintRef.current.innerText != "") {
            hintRef.current.innerText = ""
        }

        const calendarEvent = new CalendarEvent({begin: reportingBeginDate, end: reportingEndDate})
        calendarEvent.title = titleRef.current
        calendarEvent.location = locationRef.current
        calendarEvent.description = descriptionRef.current
        calendarEvent.color = colorRef.current

        if (!prop.existingCE) {
            displayContextObj.dataStore.put(calendarEvent)
        } else {
            Object.assign(prop.existingCE.prop, calendarEvent)
            displayContextObj.dataStore.update(prop.existingCE.prop)
        }
        displayContextObj.dataStoreUpdatedTime = new Date()

        event.stopPropagation()
        if (prop.callback) {
            prop.callback(PopupResult.Success, null)
        }
    }

    function handleDelete(event: React.MouseEvent) {
        if (prop.existingCE) {
            displayContextObj.dataStore.deleteCe(prop.existingCE.prop)
            displayContextObj.dataStoreUpdatedTime = new Date()
            event.stopPropagation()
            if (prop.callback) {
                prop.callback(PopupResult.Delete, null)
            }
        } else {
            new WindowManager().getController('logCreator')?.closeWindow()
            return
        }
    }

    function handleColorSelection(color: Color) {
        const controller = windowManager.getController('colorList')
        colorRef.current = color
        controller?.closeWindow()
    }

    function handleColorSelectorClick(event: React.MouseEvent) {
        windowManager.createWindow({
            view:
                <div className={'p-2'}>
                    <ColorList handleSelection={handleColorSelection}/>
                </div>,
            key: 'colorList',
            rounded: true,
            handleOutSideClick: (wc: WindowController) => wc.closeWindow()
        })
    }

    extractExistingCE()
    const windowManager = new WindowManager()
    windowManager.setOnOutsideClick('logCreator', handleOutsideClick)

    return (
        <div
            className={'w-fit p-3 bg-cyan-50 cursor-default flex-col inline-flex gap-3'}
        >
            <TextInput placeholder={"Add title"} parentRef={new RefClass(titleRef)}/>
            <span className={'whitespace-nowrap'}>
                    Begin:
                    <DateSelector callback={handleDaySelectorCallback(beginDayRef)}
                                  parentRef={new RefClass(beginDayRef)} defaultDay={beginDayRef.current}/> &nbsp;
                <TimeSelector callback={handleTimeSelectorCallback(beginTimeRef)} default={beginTimeRef.current}/>
                </span>
            <br/>
            <span className={'whitespace-nowrap'}>
                    End:
                    <DateSelector callback={handleDaySelectorCallback(endDayRef)}
                                  parentRef={new RefClass(endDayRef)} defaultDay={endDayRef.current}/> &nbsp;
                <TimeSelector callback={handleTimeSelectorCallback(endTimeRef)} default={endTimeRef.current}/>
                </span>
            <span ref={hintRef} className={'text-red-600 text-sm'}></span>

            <div onClick={handleColorSelectorClick}>
                <ColorRow color={colorRef.current} label={colorRef.current.colorName}/>
            </div>

            <TextInput placeholder={"Add location"} parentRef={new RefClass(locationRef)}/>
            <TextInput placeholder={"Add description"} parentRef={new RefClass(descriptionRef)}/>

            <div className={'mt-auto flex-row inline-flex'}>
                <button className={`${Theme.button} w-fit self-start`} onClick={handleDelete}>Delete</button>
                <button className={`${Theme.button} w-fit self-end ml-auto`}
                        onClick={handleCreate}>{submitButtonName}</button>
            </div>
        </div>
    )
}

export function CalendarEventCreatorWrapper(prop: {
    existingCE?: PropWrapper<CalendarEvent>,
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
            rounded: true
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