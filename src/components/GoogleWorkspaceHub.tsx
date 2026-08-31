import React, { useState, useEffect } from 'react';
import { Mail, HardDrive, FileText, Send, Plus, Trash2, RefreshCw, LogIn, LogOut, CheckCircle2, ShieldAlert, ExternalLink, AlertTriangle } from 'lucide-react';
import {
  signInWithGoogleWorkspace,
  logoutWorkspace,
  fetchGmailMessages,
  sendGmailMessage,
  fetchDriveFiles,
  createDriveFolder,
  deleteDriveFile,
  createGoogleDoc,
  fetchGoogleDoc,
  insertTextToGoogleDoc,
  GmailMessageSummary,
  DriveFile,
  GoogleDoc,
  getWorkspaceAccessToken,
} from '../lib/workspace.js';

interface GoogleWorkspaceHubProps {
  onSyncToDatabase?: (item: { itemType: string; title: string; snippet: string; externalId: string }) => void;
}

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({ onSyncToDatabase }) => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'drive' | 'docs'>('gmail');
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(getWorkspaceAccessToken());
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Gmail State
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<GmailMessageSummary | null>(null);
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);

  // Drive State
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [newFolderName, setNewFolderName] = useState<string>('');

  // Docs State
  const [docId, setDocId] = useState<string>('');
  const [docDetails, setDocDetails] = useState<GoogleDoc | null>(null);
  const [newDocTitle, setNewDocTitle] = useState<string>('');
  const [appendDocText, setAppendDocText] = useState<string>('');

  // Mandatory Confirmation Modal State (workspace-integration skill rule!)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'send_email' | 'delete_file' | 'create_doc' | 'append_doc' | 'create_folder';
    payload: any;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'send_email',
    payload: null,
  });

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogleWorkspace();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setStatusMessage(`Signed in as ${result.user.email}`);
      }
    } catch (err: any) {
      setStatusMessage(`Sign-In error: ${err.message || 'Authentication failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logoutWorkspace();
    setUser(null);
    setToken(null);
    setMessages([]);
    setDriveFiles([]);
    setDocDetails(null);
    setStatusMessage('Signed out');
  };

  // Initial Auto-Fetch when token available
  useEffect(() => {
    if (token) {
      if (activeTab === 'gmail') loadGmail();
      if (activeTab === 'drive') loadDrive();
      if (activeTab === 'docs' && docId) loadDoc(docId);
    }
  }, [token, activeTab]);

  const loadGmail = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const msgs = await fetchGmailMessages(token);
      setMessages(msgs);
      if (msgs.length > 0) setSelectedMsg(msgs[0]);
      setStatusMessage(`Loaded ${msgs.length} messages from Gmail`);
    } catch (e: any) {
      setStatusMessage(`Gmail load failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadDrive = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const files = await fetchDriveFiles(token);
      setDriveFiles(files);
      setStatusMessage(`Loaded ${files.length} files from Google Drive`);
    } catch (e: any) {
      setStatusMessage(`Drive load failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadDoc = async (id: string) => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const doc = await fetchGoogleDoc(token, id);
      setDocDetails(doc);
      setStatusMessage(`Loaded document: "${doc.title}"`);
    } catch (e: any) {
      setStatusMessage(`Doc load failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Confirmation Modal for Mutating Actions
  const requestConfirm = (
    title: string,
    description: string,
    actionType: 'send_email' | 'delete_file' | 'create_doc' | 'append_doc' | 'create_folder',
    payload: any
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      description,
      actionType,
      payload,
    });
  };

  // Execute Confirmed Operation
  const executeConfirmedAction = async () => {
    const { actionType, payload } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    setLoading(true);

    try {
      if (!token) throw new Error('No OAuth Access Token available');

      if (actionType === 'send_email') {
        const res = await sendGmailMessage(token, payload.to, payload.subject, payload.body);
        setStatusMessage(`Email successfully sent to ${payload.to}! (ID: ${res.id})`);
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        if (onSyncToDatabase) {
          onSyncToDatabase({ itemType: 'gmail', title: payload.subject, snippet: payload.body, externalId: res.id });
        }
        await loadGmail();
      } else if (actionType === 'delete_file') {
        await deleteDriveFile(token, payload.fileId);
        setStatusMessage(`File "${payload.fileName}" permanently deleted.`);
        await loadDrive();
      } else if (actionType === 'create_folder') {
        const folder = await createDriveFolder(token, payload.folderName);
        setStatusMessage(`Created Google Drive folder "${folder.name}"`);
        setNewFolderName('');
        await loadDrive();
      } else if (actionType === 'create_doc') {
        const doc = await createGoogleDoc(token, payload.title, payload.initialContent);
        setDocId(doc.documentId);
        setStatusMessage(`Created Google Doc "${doc.title}" (ID: ${doc.documentId})`);
        setNewDocTitle('');
        if (onSyncToDatabase) {
          onSyncToDatabase({ itemType: 'doc', title: doc.title, snippet: payload.initialContent || '', externalId: doc.documentId });
        }
        await loadDoc(doc.documentId);
      } else if (actionType === 'append_doc') {
        await insertTextToGoogleDoc(token, payload.documentId, payload.text);
        setStatusMessage(`Updated document text.`);
        setAppendDocText('');
        await loadDoc(payload.documentId);
      }
    } catch (err: any) {
      setStatusMessage(`Operation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 text-slate-100 shadow-xl">
      {/* Header & Connection Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              Google Workspace Live Suite
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 rounded border border-sky-500/30">
                OAUTH INTEGRATED
              </span>
            </h2>
            <p className="text-xs text-slate-400">Gmail, Google Drive, & Google Docs API Bridge</p>
          </div>
        </div>

        <div>
          {!token ? (
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-sky-300 font-mono flex items-center justify-between">
          <span>{statusMessage}</span>
          {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />}
        </div>
      )}

      {!token ? (
        <div className="p-8 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-xl space-y-3">
          <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">Google Workspace Sign-In Required</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click "Sign in with Google" above to grant permission to access your Gmail inbox, Google Drive files, and Google Docs documents.
          </p>
        </div>
      ) : (
        <>
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('gmail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'gmail' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Gmail Inbox ({messages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('drive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'drive' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Google Drive ({driveFiles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'docs' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Google Docs</span>
            </button>
          </div>

          {/* TAB 1: GMAIL INBOX */}
          {activeTab === 'gmail' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-mono text-slate-400 uppercase">Live Gmail Messages</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={loadGmail}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                  <button
                    onClick={() => setIsComposeOpen(true)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Compose Email
                  </button>
                </div>
              </div>

              {isComposeOpen && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-200">New Email Message</h4>
                  <input
                    type="email"
                    placeholder="Recipient email (e.g. partner@company.com)"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    placeholder="Subject line"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <textarea
                    rows={4}
                    placeholder="Write your email body..."
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsComposeOpen(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        requestConfirm(
                          'Send Email via Gmail API?',
                          `You are about to send an email to "${composeTo}" with subject "${composeSubject}".`,
                          'send_email',
                          { to: composeTo, subject: composeSubject, body: composeBody }
                        )
                      }
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Email
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMsg(m)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedMsg?.id === m.id ? 'bg-slate-800 border-sky-500/50' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-slate-200 truncate">{m.from}</span>
                        <span className="font-mono text-[10px]">{m.date}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-100 truncate mt-0.5">{m.subject}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{m.snippet}</p>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-xs text-slate-500 italic p-4 text-center">No messages loaded. Click Refresh above.</p>
                  )}
                </div>

                {selectedMsg && (
                  <div className="lg:col-span-7 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="border-b border-slate-800 pb-2">
                      <h3 className="text-sm font-bold text-slate-100">{selectedMsg.subject}</h3>
                      <p className="text-xs text-slate-400">From: {selectedMsg.from}</p>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedMsg.snippet}</p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setComposeTo(selectedMsg.from || '');
                          setComposeSubject(`Re: ${selectedMsg.subject}`);
                          setIsComposeOpen(true);
                        }}
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE DRIVE BROWSER */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-mono text-slate-400 uppercase">Google Drive Files</h3>
                <button
                  onClick={loadDrive}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {/* Create Folder Form */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="New Drive Folder Name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={() =>
                    requestConfirm(
                      'Create Drive Folder?',
                      `Create new folder "${newFolderName}" in your Google Drive root directory.`,
                      'create_folder',
                      { folderName: newFolderName }
                    )
                  }
                  disabled={!newFolderName.trim()}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Folder
                </button>
              </div>

              {/* File List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto custom-scrollbar p-1">
                {driveFiles.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-sky-400 truncate max-w-[150px]">{f.mimeType.split('.').pop()}</span>
                        {f.webViewLink && (
                          <a
                            href={f.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-sky-300"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 truncate mt-1">{f.name}</h4>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-mono text-slate-500">{f.modifiedTime?.substring(0, 10)}</span>
                      <button
                        onClick={() =>
                          requestConfirm(
                            'Delete File from Google Drive?',
                            `Permanently remove file "${f.name}" from your Google Drive. This cannot be undone.`,
                            'delete_file',
                            { fileId: f.id, fileName: f.name }
                          )
                        }
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {driveFiles.length === 0 && (
                  <p className="text-xs text-slate-500 italic p-4 text-center col-span-3">No files found or loaded.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE DOCS CREATOR & EDITOR */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono text-slate-400 uppercase">Google Docs Creator & Editor</h3>

              {/* Create New Doc Form */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200">Create New Google Document</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Document Title (e.g. AI Grant Proposal 2026)"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={() =>
                      requestConfirm(
                        'Create Google Doc?',
                        `Create new document "${newDocTitle}" in your Google Drive.`,
                        'create_doc',
                        { title: newDocTitle, initialContent: 'Document created via Atlas AI Workspace Suite.' }
                      )
                    }
                    disabled={!newDocTitle.trim()}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Document
                  </button>
                </div>
              </div>

              {/* View/Edit Doc Section */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200">Inspect Existing Document</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter Document ID..."
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <button
                    onClick={() => loadDoc(docId)}
                    disabled={!docId.trim()}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Fetch Document
                  </button>
                </div>

                {docDetails && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-sky-300">{docDetails.title}</h3>
                      <span className="text-[10px] font-mono text-slate-500">ID: {docDetails.documentId}</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 max-h-40 overflow-y-auto font-sans text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {docDetails.bodyText}
                    </div>

                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        placeholder="Append new text paragraph to Google Doc..."
                        value={appendDocText}
                        onChange={(e) => setAppendDocText(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            requestConfirm(
                              'Append Text to Google Doc?',
                              `Insert text into document "${docDetails.title}".`,
                              'append_doc',
                              { documentId: docDetails.documentId, text: appendDocText }
                            )
                          }
                          disabled={!appendDocText.trim()}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Append Text
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MANDATORY USER CONFIRMATION DIALOG MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{confirmModal.description}</p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Operation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
