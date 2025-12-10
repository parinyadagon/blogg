package domain

import (
	"blogg/utils/errs"
	"net/http"
)

type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

type UserRegisterReq struct {
	Username string `json:"username" validate:"required,min=4,max=32"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=4"`
}

type UserRegisterRes struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}

type UserLoginReq struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type UserLoginRes struct {
	AccessToken string `json:"access_token"`
	Username    string `json:"username"`
}

var (
	ErrUsernameExists     = errs.New(errs.Params{Code: "USERNAME_EXISTS", Message: "Username already exists", StatusCode: http.StatusConflict})
	ErrEmailExists        = errs.New(errs.Params{Code: "EMAIL_EXISTS", Message: "Email already exists", StatusCode: http.StatusConflict})
	ErrInvalidCredentials = errs.New(errs.Params{Code: "INVALID_CREDENTIALS", Message: "Invalid username or password", StatusCode: http.StatusUnauthorized})
	ErrUserNotFound       = errs.New(errs.Params{Code: "USER_NOT_FOUND", Message: "User not found", StatusCode: http.StatusNotFound})
)
