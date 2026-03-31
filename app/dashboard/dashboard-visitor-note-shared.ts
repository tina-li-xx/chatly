type VisitorNoteIdentity = {
  conversationId?: string | null;
  siteId?: string | null;
  sessionId?: string | null;
  email?: string | null;
};

export function buildVisitorNoteIdentityParams(props: VisitorNoteIdentity) {
  const params = new URLSearchParams();

  if (props.conversationId) {
    params.set("conversationId", props.conversationId);
    return params;
  }

  if (!props.siteId || (!props.email && !props.sessionId)) {
    return null;
  }

  params.set("siteId", props.siteId);
  if (props.email) {
    params.set("email", props.email);
  }
  if (props.sessionId) {
    params.set("sessionId", props.sessionId);
  }

  return params;
}
