/* ───────────────────────────────────────────────────────────────────────────
   Everything the page says lives in this file.
   Edit the words here; no other file needs to change.

   • summary.placeholder  → set to false once the real summary is in (hides the "draft" chip)
   • documents.items      → drop the file into /downloads using the exact `file` name and the
                            card goes live on its own (the page checks the folder on load)
   • Wrap one word in *stars* in a headline to give it the brand gradient
   • theme: 'blue' | 'green' sets a track's / card's accent colour
   ─────────────────────────────────────────────────────────────────────────── */
window.CONTENT = {
  meta: {
    title: 'ChargeHive EV × UrbanCart Mobility',
    description: 'A partnership proposal from ChargeHive EV to UrbanCart Mobility.',
  },

  partner: {
    a: 'ChargeHive EV',
    b: 'UrbanCart Mobility',
    label: 'Partnership proposal · October 2026',
    // The two names that decode on the intro. `to` can be a person instead of the company.
    credit: { fromLabel: 'Presented by', from: 'Kanishq Raj', fromRole: 'Founder', toLabel: 'Prepared for', to: 'UrbanCart Mobility' },
  },

  hero: {
    headline: 'Roadside help and a local marketplace, *powered* by one network.',
    sub: 'A proposal for ChargeHive EV and UrbanCart Mobility to bring Emergency Roadside Assistance and a hyperlocal Marketplace to UrbanCart’s customers.',
    ctaSummary: 'Read the summary',
    ctaDocs: 'Get the documents',
  },

  summary: {
    placeholder: true,
    eyebrow: 'The summary',
    title: 'Two workstreams. One partnership.',
    lead: 'Two collaboration tracks under one partnership: physical response and mobile commerce, connected by ChargeHive’s digital infrastructure.',
    tracks: [
      {
        n: '01',
        theme: 'blue',
        name: 'Emergency Roadside Assistance',
        short: 'ERA',
        text: 'UrbanCart brings the physical response. ChargeHive provides the digital ERA infrastructure.',
        points: [
          'Customers request assistance through ChargeHive, while UrbanCart controls how each order is assigned or opened to its partner network.',
          'UrbanCart receives a dedicated branded presence inside the platform.',
          'Start with a focused pilot or expand into a broader deployment.',
        ],
        note: '',
      },
      {
        n: '02',
        theme: 'green',
        name: 'Marketplace',
        short: 'Marketplace',
        text: 'UrbanCart puts the business on wheels. ChargeHive connects that business digitally.',
        points: [
          'Customers can discover nearby UrbanCart businesses, browse products and place orders through a branded marketplace experience.',
          'We’ll customise the infrastructure around UrbanCart’s unique mobile-commerce model, including special consideration for low-margin FMCG categories.',
          'The agreed core software customisation is built by ChargeHive without passing that development cost to UrbanCart.',
        ],
        note: '',
      },
    ],
  },

  documents: {
    eyebrow: 'The documents',
    title: 'Everything to review, ready to download.',
    lead: 'Each workstream has a written proposal and a presentation deck.',
    soon: 'Coming soon',
    // icon: 'doc' | 'slides' picks the card artwork; kind is the badge text; pages is optional.
    items: [
      {
        track: 'Emergency Roadside Assistance',
        theme: 'blue',
        kind: 'PDF',
        icon: 'doc',
        title: 'ERA Proposal',
        desc: 'The written proposal for an ERA-only collaboration: UrbanCart’s mobile service platform connected to ChargeHive’s digital request and dispatch infrastructure.',
        file: 'ChargeHive-EV-x-UrbanCart-ERA-Proposal.pdf',
        pages: 10,
        available: true, // only used when the page is opened as a plain file; a live host checks /downloads itself
      },
      {
        track: 'Emergency Roadside Assistance',
        theme: 'blue',
        kind: 'PDF',
        icon: 'slides',
        title: 'ERA Presentation',
        desc: 'The presentation overview: mobile EV support powered by physical response and digital infrastructure.',
        file: 'ChargeHive-EV-x-UrbanCart-ERA-Deck.pdf',
        pages: 6,
        available: true,
      },
      {
        track: 'Marketplace',
        theme: 'green',
        kind: 'PDF',
        icon: 'doc',
        title: 'Marketplace Proposal',
        desc: 'The written proposal for Marketplace and business operations: from business on wheels to business connected.',
        file: 'ChargeHive-EV-x-UrbanCart-Marketplace-Proposal.pdf',
        pages: 12,
        available: true,
      },
      {
        track: 'Marketplace',
        theme: 'green',
        kind: 'PDF',
        icon: 'slides',
        title: 'Marketplace Presentation',
        desc: 'The presentation overview: build the vehicle, connect the business.',
        file: 'ChargeHive-EV-x-UrbanCart-Marketplace-Deck.pdf',
        pages: 8,
        available: true,
      },
    ],
  },

  closing: {
    eyebrow: 'In short',
    title: 'The whole proposal, in three lines.',
    lines: [
      { k: 'What', v: 'Physical mobility, connected by digital infrastructure.' },
      { k: 'For', v: 'UrbanCart, its operators, and its customers.' },
      { k: 'Next', v: 'Review the vision. Then let’s explore what we can build together.' },
    ],
    cta: 'Start the conversation',
    email: 'support@chargehiveev.com',
    subject: 'ChargeHive EV × UrbanCart Mobility',
  },

  footer: {
    prepared: 'Prepared for UrbanCart Mobility',
    note: 'Confidential. Shared for evaluation only.',
    replay: 'Replay intro',
  },
};
