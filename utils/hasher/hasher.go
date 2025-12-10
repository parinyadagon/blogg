package hasher

import "github.com/matthewhartstonge/argon2"

type ArgonHash struct {
	argon argon2.Config
}

func NewArgonHash() *ArgonHash {
	return &ArgonHash{
		argon: argon2.DefaultConfig(),
	}
}

func NewArgonHashWithConfig(cfg argon2.Config) *ArgonHash {
	return &ArgonHash{
		argon: cfg,
	}
}

func (a *ArgonHash) Hash(password string) (string, error) {
	encoded, err := a.argon.HashEncoded([]byte(password))
	if err != nil {
		return "", err
	}
	return string(encoded), nil
}

func (a *ArgonHash) Verify(password, encodeHash string) (bool, error) {
	ok, err := argon2.VerifyEncoded([]byte(password), []byte(encodeHash))
	if err != nil {
		return false, err
	}
	return ok, nil
}
