import pathlib
text = pathlib.Path(r"src/app/dashboard/[semesterAndyear]/all-timeslot/AllTimeslotClient.tsx").read_text(encoding="utf-8").replace('\r\n','\n')
marker_start = '        <Stack\n            direction={isTablet ? "column" : "row"}\n            justifyContent="space-between"\n            alignItems={isTablet ? "flex-start" : "center"}\n            spacing={2}\n            className="no-print"\n          >'
start = text.index(marker_start)
print(text[start:start+400])
marker_end = '\n        </Stack>\n\n        <Box'
end = text.index(marker_end, start) + len('\n        </Stack>\n\n')
print('---END PREVIEW---')
print(text[end:end+20])
