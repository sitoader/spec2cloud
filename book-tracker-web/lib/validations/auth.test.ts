import {
  bookTrackerSignupFormSchema,
  bookTrackerLoginFormSchema,
  rateBookTrackerPassword,
} from './auth';

/* ------------------------------------------------------------------ */
/*  Signup schema                                                      */
/* ------------------------------------------------------------------ */

describe('bookTrackerSignupFormSchema', () => {
  const validSignupDraft = {
    email: 'collector@booktracker.test',
    password: 'Shelves42',
    confirmPassword: 'Shelves42',
    displayName: 'Book Collector',
  };

  it('accepts a fully-valid signup draft', () => {
    const result = bookTrackerSignupFormSchema.safeParse(validSignupDraft);
    expect(result.success).toBe(true);
  });

  it('accepts a draft without the optional displayName', () => {
    const { displayName: _omitted, ...draft } = validSignupDraft;
    const result = bookTrackerSignupFormSchema.safeParse(draft);
    expect(result.success).toBe(true);
  });

  it('rejects when email is missing', () => {
    const result = bookTrackerSignupFormSchema.safeParse({
      ...validSignupDraft,
      email: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email format', () => {
    const result = bookTrackerSignupFormSchema.safeParse({
      ...validSignupDraft,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = bookTrackerSignupFormSchema.safeParse({
      ...validSignupDraft,
      password: 'Ab1',
      confirmPassword: 'Ab1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password with no uppercase letter', () => {
    const result = bookTrackerSignupFormSchema.safeParse({
      ...validSignupDraft,
      password: 'alllower1',
      confirmPassword: 'alllower1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password with no lowercase letter', () => {
    const result = bookTrackerSignupFormSchema.safeParse({
      ...validSignupDraft,
      password: 'ALLUPPER1',
      confirmPassword: 'ALLUPPER1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password with no digit', () => {
    const result = bookTrackerSignupFormSchema.safeParse({
      ...validSignupDraft,
      password: 'NoDigitsHere',
      confirmPassword: 'NoDigitsHere',
    });
    expect(result.success).toBe(false);
  });

  it('rejects when confirmPassword does not match password', () => {
    const result = bookTrackerSignupFormSchema.safeParse({
      ...validSignupDraft,
      confirmPassword: 'DifferentPass9',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('confirmPassword');
    }
  });
});

/* ------------------------------------------------------------------ */
/*  Login schema                                                       */
/* ------------------------------------------------------------------ */

describe('bookTrackerLoginFormSchema', () => {
  const validLoginDraft = {
    email: 'reader@booktracker.test',
    password: 'MySecret1',
  };

  it('accepts valid login credentials', () => {
    const result = bookTrackerLoginFormSchema.safeParse(validLoginDraft);
    expect(result.success).toBe(true);
  });

  it('accepts credentials with optional rememberMe flag', () => {
    const result = bookTrackerLoginFormSchema.safeParse({
      ...validLoginDraft,
      rememberMe: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects when email is empty', () => {
    const result = bookTrackerLoginFormSchema.safeParse({
      ...validLoginDraft,
      email: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects when password is empty', () => {
    const result = bookTrackerLoginFormSchema.safeParse({
      ...validLoginDraft,
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  Password strength rater                                            */
/* ------------------------------------------------------------------ */

describe('rateBookTrackerPassword', () => {
  it('rates a very short input as fragile', () => {
    const verdict = rateBookTrackerPassword('ab');
    expect(verdict.rating).toBe('fragile');
    expect(verdict.text).toBe('Weak — add more variety');
  });

  it('rates an empty string as fragile', () => {
    const verdict = rateBookTrackerPassword('');
    expect(verdict.rating).toBe('fragile');
    expect(verdict.text).toBe('Weak — add more variety');
  });

  it('rates a medium-complexity password as decent', () => {
    // length >= 8 (+1), has lowercase (+1), has uppercase (+1) = tally 3 → decent
    const verdict = rateBookTrackerPassword('Bookmark');
    expect(verdict.rating).toBe('decent');
    expect(verdict.text).toBe('Fair — could be stronger');
  });

  it('rates a high-variety long password as solid', () => {
    // length >= 8 (+1), >= 12 (+1), upper (+1), lower (+1), digit (+1), symbol (+1) = 6
    const verdict = rateBookTrackerPassword('MyLibrary#2024!');
    expect(verdict.rating).toBe('solid');
    expect(verdict.text).toBe('Strong password');
  });
});
