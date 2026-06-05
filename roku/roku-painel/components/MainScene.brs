' ╔══════════════════════════════════════════════════════════╗
' ║  MainScene.brs — JaboataoPrev Painel de Senhas           ║
' ║  Backend WS: ws://10.0.0.100:3001/roku-ws                ║
' ╚══════════════════════════════════════════════════════════╝

sub init()
    m.WS_URL         = "ws://10.0.0.100:3001/roku-ws"
    m.MAX_IN_PROGRESS = 4
    m.MAX_WAITING     = 5
    m.wsTask = CreateObject("roSGNode", "WebSocketTask")
    m.wsTask.wsUrl = m.WS_URL
    m.wsTask.observeField("payload", "onTicketChange")
    m.wsTask.observeField("status",  "onStatusChange")
    m.wsTask.control = "RUN"

    m.inProgress = []
    m.waiting    = []

    m.clockTimer = CreateObject("roSGNode", "Timer")
    m.clockTimer.duration = 1
    m.clockTimer.repeat   = true
    m.clockTimer.observeField("fire", "onClockTick")
    m.clockTimer.control  = "start"

    renderAll()
    onClockTick()
end sub

' ── RELÓGIO ──────────────────────────────────────────────
sub onClockTick()
    dt = CreateObject("roDateTime")
    dt.ToLocalTime()

    h  = dt.GetHours()
    mi = dt.GetMinutes()
    s  = dt.GetSeconds()
    m.top.findNode("clockLabel").text = pad2(h) + ":" + pad2(mi) + ":" + pad2(s)

    months = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]
    days   = ["dom","seg","ter","qua","qui","sex","sáb"]
    m.top.findNode("dateLabel").text = days[dt.GetDayOfWeek()] + ", " + months[dt.GetMonth()-1] + " " + str(dt.GetDayOfMonth()).trim()
end sub

function pad2(n as integer) as string
    if n < 10 then return "0" + str(n).trim()
    return str(n).trim()
end function

' ── STATUS WS ────────────────────────────────────────────
sub onStatusChange()
    dot = m.top.findNode("statusDot")
    s   = m.wsTask.status
    if s = "connected" then
        dot.color = "0x3BAD6AFF"
    else if s = "connecting" then
        dot.color = "0xFFAA00FF"
    else
        dot.color = "0xFF4444FF"
    end if
end sub

' ── RECEBE ticket:change ─────────────────────────────────
'
'  payload recebido pelo WebSocketTask:
'  {
'    type: "UPDATE" | "INSERT" | "DELETE"
'    data: { id, formatted_number, attendee_name,
'            status, is_priority, started_at, created_at, ... }
'  }
sub onTicketChange()
    p = m.wsTask.payload
    if p = invalid then return

    t = p.data
    if t = invalid then return
    if not isToday(t.created_at) then return

    if p.type = "DELETE" then
        removeLocal(t.id)
    else
        addOrUpdateLocal(t)
    end if

    renderAll()
end sub

' ── ESTADO LOCAL ─────────────────────────────────────────
sub addOrUpdateLocal(t as object)
    removeLocal(t.id)

    if t.status = "in_progress" then
        m.inProgress.push(t)
        sortDesc(m.inProgress, "started_at")
        trimTo(m.inProgress, m.MAX_IN_PROGRESS)

    else if t.status = "waiting" then
        m.waiting.push(t)
        sortAsc(m.waiting, "created_at")
        trimTo(m.waiting, m.MAX_WAITING)
    end if
end sub

sub removeLocal(id as string)
    m.inProgress = without(m.inProgress, id)
    m.waiting    = without(m.waiting,    id)
end sub

function without(arr as object, id as string) as object
    r = []
    for each t in arr
        if t.id <> id then r.push(t)
    end for
    return r
end function

sub sortDesc(arr as object, field as string)
    n = arr.count()
    for i = 0 to n-2
        for j = 0 to n-2-i
            if arr[j][field] < arr[j+1][field] then
                tmp = arr[j] : arr[j] = arr[j+1] : arr[j+1] = tmp
            end if
        end for
    end for
end sub

sub sortAsc(arr as object, field as string)
    n = arr.count()
    for i = 0 to n-2
        for j = 0 to n-2-i
            if arr[j][field] > arr[j+1][field] then
                tmp = arr[j] : arr[j] = arr[j+1] : arr[j+1] = tmp
            end if
        end for
    end for
end sub

sub trimTo(arr as object, max as integer)
    while arr.count() > max
        arr.pop()
    end while
end sub

' ── RENDERIZAÇÃO ─────────────────────────────────────────
sub renderAll()
    renderMainCard()
    renderSecCards()
    renderWaiting()
end sub

sub renderMainCard()
    t = m.inProgress[0]

    if t <> invalid then
        m.top.findNode("mainNumber").text  = t.formatted_number
        m.top.findNode("mainName").text    = safeName(t.attendee_name)
        m.top.findNode("mainGuiche").text  = guiche(t)
        m.top.findNode("mainCard").color   = "0x3BAD6AFF"
        m.top.findNode("badgeLabel").text  = "● Em Atendimento"
    else
        m.top.findNode("mainNumber").text  = "---"
        m.top.findNode("mainName").text    = "Nenhuma senha em atendimento"
        m.top.findNode("mainGuiche").text  = ""
        m.top.findNode("mainCard").color   = "0xCDD5E0FF"
        m.top.findNode("badgeLabel").text  = ""
    end if
end sub

sub renderSecCards()
    ids = [
        { g:"sec0guiche", n:"sec0num", nm:"sec0name", r:"sec0" },
        { g:"sec1guiche", n:"sec1num", nm:"sec1name", r:"sec1" },
        { g:"sec2guiche", n:"sec2num", nm:"sec2name", r:"sec2" }
    ]
    for i = 0 to 2
        t  = m.inProgress[i+1]
        id = ids[i]
        if t <> invalid then
            m.top.findNode(id.g).text  = guiche(t)
            m.top.findNode(id.n).text  = t.formatted_number
            m.top.findNode(id.nm).text = safeName(t.attendee_name)
            m.top.findNode(id.r).color = "0xFFFFFFFF"
        else
            m.top.findNode(id.g).text  = ""
            m.top.findNode(id.n).text  = ""
            m.top.findNode(id.nm).text = ""
            m.top.findNode(id.r).color = "0xFFFFFF55"
        end if
    end for
end sub

sub renderWaiting()
    ids = [
        { n:"w0num", nm:"w0name", r:"w0" },
        { n:"w1num", nm:"w1name", r:"w1" },
        { n:"w2num", nm:"w2name", r:"w2" },
        { n:"w3num", nm:"w3name", r:"w3" },
        { n:"w4num", nm:"w4name", r:"w4" }
    ]
    for i = 0 to 4
        t  = m.waiting[i]
        id = ids[i]
        if t <> invalid then
            m.top.findNode(id.n).text  = t.formatted_number
            m.top.findNode(id.nm).text = safeName(t.attendee_name)
            m.top.findNode(id.r).color = "0xFFFFFFFF"
        else
            m.top.findNode(id.n).text  = "—"
            m.top.findNode(id.nm).text = ""
            m.top.findNode(id.r).color = "0xFFFFFF55"
        end if
    end for
end sub

' ── HELPERS ──────────────────────────────────────────────
function guiche(t as object) as string
    if t.is_priority = true then return "Guichê 1 (Prioritário)"
    return "Geral"
end function

function safeName(name as dynamic) as string
    if name = invalid or name = "" then return "Nome não informado"
    return name
end function

function isToday(dateStr as dynamic) as boolean
    if dateStr = invalid or dateStr = "" then return false
    dt = CreateObject("roDateTime")
    dt.ToLocalTime()
    today = str(dt.GetYear()).trim() + "-" + pad2(dt.GetMonth()) + "-" + pad2(dt.GetDayOfMonth())
    return left(dateStr, 10) = today
end function
