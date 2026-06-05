sub init()
    m.top.functionName = "runTask"
end sub

sub runTask()
    while true
        connectAndListen()
        m.top.status = "disconnected"
        wait(3000, CreateObject("roMessagePort"))
    end while
end sub

sub connectAndListen()
    ws = CreateObject("roWebSocket")
    port = CreateObject("roMessagePort")
    ws.SetMessagePort(port)
    
    if m.top.wsUrl = invalid or m.top.wsUrl = "" then
        m.top.status = "disconnected"
        return
    end if
    
    ws.SetUri(m.top.wsUrl)

    m.top.status = "connecting"
    ws.Connect()

    lastPing& = 0

    while true
        msg = wait(5000, port)

        now& = nowMs()
        if m.top.status = "connected" and (now& - lastPing&) >= 25000 then
            ws.SendString(FormatJSON({ type: "PING" }))
            lastPing& = now&
        end if

        if msg = invalid then
            ' timeout normal
        else if type(msg) = "roWebSocketEvent" then
            if msg.isConnected() then
                m.top.status = "connected"
                lastPing& = nowMs()

            else if msg.isString() then
                parsed = ParseJSON(msg.getString())
                if parsed <> invalid then
                    if parsed.event = "ticket:change" and parsed.data <> invalid then
                        m.top.payload = parsed.data
                    end if
                end if

            else if msg.isClose() or msg.isFailed() then
                ws.Close()
                return
            end if
        end if
    end while
end sub

function nowMs() as LongInteger
    dt = CreateObject("roDateTime")
    return dt.AsSeconds() * 1000
end function
