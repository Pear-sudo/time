export function isSafari() {
    const userAgent = navigator.userAgent
    return /^((?!chrome|android).)*safari/i.test(userAgent)
}