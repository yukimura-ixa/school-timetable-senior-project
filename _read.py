import pathlib
text = pathlib.Path(r"src/app/dashboard/[semesterAndyear]/all-timeslot/AllTimeslotClient.tsx").read_text(encoding="utf-8")
marker = 'className="no-print"'
idx = text.index(marker)
print(text[idx-200:idx+800])
