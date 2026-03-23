# RKH Penyuluh KB Clone

## Current State
- Report form (ReportForm.tsx) has a placeholder attachment dropzone with no real functionality
- ReportHistory.tsx has a download button that only triggers browser print dialog
- Registration in RegisterPage.tsx and App.tsx works but has poor error handling and UX

## Requested Changes (Diff)

### Add
- 2 real file attachment slots in ReportForm (supports PDF, PNG, Word, PowerPoint, Excel, and all other file types)
- Each attachment shows filename, file type icon, and remove button
- Attachments stored in localStorage (keyed by report id / session) since ICP has 2MB message limits
- Download button in ReportHistory generates a downloadable HTML file of the report content (with signature if available)

### Modify
- ReportForm: replace placeholder dropzone with functional 2-slot file attachment area
- ReportHistory: download button triggers actual file download (HTML blob), not just print
- Report type in types.ts: add `lampiran?: {name: string; type: string; dataUrl: string}[]` field
- App.tsx: improve registration error messaging with specific error details; disable submit button when actor is not ready
- RegisterPage.tsx: disable submit button if actor is not ready; show clearer loading state

### Remove
- Nothing removed

## Implementation Plan
1. Update `types.ts` to add `lampiran` array field to Report
2. Update `ReportForm.tsx` to allow uploading up to 2 files of any type, showing filename and remove option
3. Update `ReportHistory.tsx` download to generate a downloadable HTML blob instead of print
4. Update `App.tsx` handleRegisterUser to surface detailed error messages
5. Update `RegisterPage.tsx` to disable submit when actor not ready
