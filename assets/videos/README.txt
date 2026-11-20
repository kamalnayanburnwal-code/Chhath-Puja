DROP YOUR VIDEOS HERE (exact file names, no code changes needed)


  preparation-step-02.mp4   Preparation Step 2
  preparation-step-03.mp4   Preparation Step 3
  preparation-step-04.mp4   Preparation Step 4
  preparation-step-05.mp4   Preparation Step 5
  club-message.mp4          The 1:30 club video (six members)
  distribution-clip.mp4     Optional clip in "Our Initiative"

.webm and .mov are also picked up automatically.
Extra steps: copy a line in the `steps` list at the top of script.js
(e.g. preparation-step-06) and add the file here.

Compress before uploading (H.264, works on every phone; GitHub limit is 100 MB per file):
  ffmpeg -i input.mov -vf "scale=-2:720" -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 96k -movflags +faststart preparation-step-01.mp4

SOUND: the 5 preparation clips and the distribution clip have NO audio track at all (removed from the files) and are muted in code too.
The club message keeps its sound and lowers the music while it plays.
To change this, edit the data-muted attribute in index.html and the "muted: true" in script.js.
