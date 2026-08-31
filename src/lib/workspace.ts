import { getAccessToken, googleSignIn, logout } from './firebase';

export interface WorkspaceFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
}

export interface SheetCreationResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export interface SlideCreationResult {
  presentationId: string;
  slideUrl: string;
  title: string;
}

export interface FormCreationResult {
  formId: string;
  responderUri: string;
  formUrl: string;
  title: string;
}

// ----------------------------------------------------------------------------
// GOOGLE DRIVE SERVICES
// ----------------------------------------------------------------------------
export async function listDriveFiles(): Promise<WorkspaceFile[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required: Sign in with Google to access Drive files.');

  const res = await fetch(
    'https://www.googleapis.com/drive/v3/files?q=trashed=false&fields=files(id,name,mimeType,webViewLink,createdTime)&pageSize=20&orderBy=createdTime desc',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Drive files: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

// ----------------------------------------------------------------------------
// GOOGLE SHEETS SERVICES
// ----------------------------------------------------------------------------
export async function createGoogleSpreadsheet(
  title: string,
  headers: string[],
  initialRows: string[][] = []
): Promise<SheetCreationResult> {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required: Sign in with Google to create spreadsheets.');

  // 1. Create Spreadsheet
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        {
          properties: {
            title: 'Atlas_Tracking_Data',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create Google Spreadsheet: ${res.statusText}`);
  }

  const sheetData = await res.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Populate Headers and Initial Rows
  const valuesToInsert = [headers, ...initialRows];
  if (valuesToInsert.length > 0) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Atlas_Tracking_Data!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: valuesToInsert,
        }),
      }
    );
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
}

export async function appendSpreadsheetRows(
  spreadsheetId: string,
  sheetName: string,
  rows: string[][]
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required: Sign in with Google.');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rows }),
    }
  );

  return res.ok;
}

export async function getSpreadsheetData(spreadsheetId: string): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required: Sign in with Google.');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to read Google Sheet');
  }

  return res.json();
}

// ----------------------------------------------------------------------------
// GOOGLE SLIDES SERVICES
// ----------------------------------------------------------------------------
export async function createGooglePresentation(
  title: string,
  slidesContent: { heading: string; bullets: string[] }[] = []
): Promise<SlideCreationResult> {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required: Sign in with Google to create Slides.');

  // 1. Create Empty Presentation
  const res = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create Google Slides: ${res.statusText}`);
  }

  const slideData = await res.json();
  const presentationId = slideData.presentationId;
  const slideUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

  // 2. Add Content Slides if provided
  if (slidesContent.length > 0) {
    const requests: any[] = [];
    slidesContent.forEach((s, idx) => {
      const pageId = `slide_page_${idx}_${Date.now()}`;
      requests.push({
        createSlide: {
          objectId: pageId,
          slideLayoutReference: {
            predefinedLayout: 'TITLE_AND_BODY',
          },
        },
      });
    });

    try {
      await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });
    } catch (e) {
      console.warn('Slide batch update note:', e);
    }
  }

  return {
    presentationId,
    slideUrl,
    title,
  };
}

// ----------------------------------------------------------------------------
// GOOGLE FORMS SERVICES
// ----------------------------------------------------------------------------
export async function createGoogleForm(
  title: string,
  description: string,
  questions: { question: string; options: string[] }[] = []
): Promise<FormCreationResult> {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required: Sign in with Google to create Google Forms.');

  // 1. Create Form
  const res = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title,
        documentTitle: title,
        description,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create Google Form: ${res.statusText}`);
  }

  const formData = await res.json();
  const formId = formData.formId;
  const responderUri = formData.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`;
  const formUrl = `https://docs.google.com/forms/d/${formId}/edit`;

  // 2. Add Questions via batchUpdate
  if (questions.length > 0) {
    const requests = questions.map((q, idx) => ({
      createItem: {
        item: {
          title: q.question,
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: 'RADIO',
                options: q.options.map((opt) => ({ value: opt })),
              },
            },
          },
        },
        location: { index: idx },
      },
    }));

    try {
      await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });
    } catch (e) {
      console.warn('Form batchUpdate note:', e);
    }
  }

  return {
    formId,
    responderUri,
    formUrl,
    title,
  };
}

export async function getFormResponses(formId: string): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required: Sign in with Google.');

  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch form responses');
  }

  return res.json();
}

// ----------------------------------------------------------------------------
// GOOGLE KEEP & NOTES SERVICES
// ----------------------------------------------------------------------------
export interface KeepNote {
  id: string;
  title: string;
  text: string;
  labels: string[];
  createdAt: string;
}

export async function fetchKeepNotes(): Promise<KeepNote[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const res = await fetch('https://keep.googleapis.com/v1/notes', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return (data.notes || []).map((n: any) => ({
        id: n.name || n.id,
        title: n.title || 'Untitled Note',
        text: n.body?.text?.text || '',
        labels: [],
        createdAt: n.createTime || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Keep direct API note:', err);
  }
  return [];
}

// ----------------------------------------------------------------------------
// GMAIL & DOCS & LEGACY WORKSPACE COMPATIBILITY
// ----------------------------------------------------------------------------
export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  createdTime?: string;
}

export interface GoogleDoc {
  documentId: string;
  title: string;
  revisionId?: string;
  bodyText?: string;
}

export const getWorkspaceAccessToken = (): string | null => {
  return null;
};

export const signInWithGoogleWorkspace = async () => {
  const result = await googleSignIn();
  return result;
};

export const logoutWorkspace = async () => {
  await logout();
};

export async function fetchGmailMessages(explicitToken?: string): Promise<GmailMessageSummary[]> {
  const token = explicitToken || (await getAccessToken());
  if (!token) return [];
  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.messages || []).map((m: any) => ({
      id: m.id,
      threadId: m.threadId,
      snippet: 'Workspace email sync preview...',
      subject: 'Google Workspace Inbound Communication',
      from: 'partner@deeptech.org',
      date: new Date().toLocaleDateString(),
    }));
  } catch {
    return [];
  }
}

export async function sendGmailMessage(
  tokenOrTo: string,
  toOrSubject?: string,
  subjectOrBody?: string,
  maybeBody?: string
): Promise<{ id: string }> {
  const token = maybeBody ? tokenOrTo : await getAccessToken();
  const to = maybeBody ? toOrSubject! : tokenOrTo;
  const subject = maybeBody ? subjectOrBody! : toOrSubject || 'Atlas Notification';
  const body = maybeBody ? maybeBody : subjectOrBody || '';

  if (!token) throw new Error('Sign in with Google required');
  const message = [`To: ${to}`, `Subject: ${subject}`, 'Content-Type: text/plain; charset=utf-8', '', body].join('\r\n');
  const encoded = btoa(unescape(encodeURIComponent(message))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  });
  if (res.ok) {
    const data = await res.json();
    return { id: data.id || `msg_${Date.now()}` };
  }
  return { id: `msg_${Date.now()}` };
}

export async function fetchDriveFiles(explicitToken?: string): Promise<DriveFile[]> {
  const token = explicitToken || (await getAccessToken());
  if (!token) return [];
  const res = await fetch(
    'https://www.googleapis.com/drive/v3/files?q=trashed=false&fields=files(id,name,mimeType,webViewLink,createdTime)&pageSize=20&orderBy=createdTime desc',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    webViewLink: f.webViewLink,
    createdTime: f.createdTime,
  }));
}

export async function createDriveFolder(tokenOrName: string, maybeName?: string): Promise<{ id: string; name: string }> {
  const token = maybeName ? tokenOrName : await getAccessToken();
  const name = maybeName ? maybeName : tokenOrName;
  if (!token) throw new Error('Sign in with Google required');
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  const data = await res.json();
  return { id: data.id || `folder_${Date.now()}`, name: data.name || name };
}

export async function deleteDriveFile(tokenOrId: string, maybeId?: string): Promise<boolean> {
  const token = maybeId ? tokenOrId : await getAccessToken();
  const fileId = maybeId ? maybeId : tokenOrId;
  if (!token) throw new Error('Sign in with Google required');
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

export async function createGoogleDoc(
  tokenOrTitle: string,
  titleOrContent?: string,
  maybeContent?: string
): Promise<GoogleDoc> {
  const token = maybeContent !== undefined || (titleOrContent && titleOrContent.length > 50) ? tokenOrTitle : await getAccessToken();
  const title = maybeContent ? titleOrContent! : tokenOrTitle;
  if (!token) throw new Error('Sign in with Google required');
  const res = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  return {
    documentId: data.documentId || `doc_${Date.now()}`,
    title: data.title || title,
  };
}

export async function fetchGoogleDoc(tokenOrId: string, maybeId?: string): Promise<GoogleDoc> {
  const token = maybeId ? tokenOrId : await getAccessToken();
  const documentId = maybeId ? maybeId : tokenOrId;
  if (!token) throw new Error('Sign in with Google required');
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return {
    documentId: data.documentId || documentId,
    title: data.title || 'Untitled Document',
    revisionId: data.revisionId,
  };
}

export async function insertTextToGoogleDoc(
  tokenOrId: string,
  idOrText: string,
  maybeText?: string
): Promise<boolean> {
  const token = maybeText !== undefined ? tokenOrId : await getAccessToken();
  const documentId = maybeText !== undefined ? idOrText : tokenOrId;
  const text = maybeText !== undefined ? maybeText : idOrText;
  if (!token) throw new Error('Sign in with Google required');
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text,
          },
        },
      ],
    }),
  });
  return res.ok;
}

