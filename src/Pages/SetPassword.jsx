import axios from "axios";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SetPassword = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const showErrorAlert = (message) => {
        return Swal.fire({
            title: "Error!",
            text: message,
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#4F46E5",
            position: "center",
            customClass: {
                popup: 'animated fadeInDown'
            }
        });
    };

    const showSuccessAlert = (message) => {
        return Swal.fire({
            title: "Success!",
            text: message,
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#4F46E5",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            position: "center",
            customClass: {
                popup: 'animated fadeInDown'
            }
        });
    };

    const handleFormSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post("http://localhost:8080/api/v1/auth/setPassword",
                {
                    password: data.password,
                    confirmPassword: data.confirmPassword,
                    uuid: uuid
                }
            );

            if (response.data.code === 200) {
                await showSuccessAlert(response.data.message || "Password set successfully!");
                navigate("/login");
            } else {
                await showErrorAlert(response.data.message || "Failed to set password. Please try again.");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to set password. Please try again.";
            await showErrorAlert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Set New Password</h2>
                    <p className="text-gray-600">Please enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password", {
                                    required: "Password is required"
                                })}
                                className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="h-5 w-5" />
                                ) : (
                                    <FaEye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                {...register("confirmPassword", {
                                    required: "Please confirm your password"
                                })}
                                className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showConfirmPassword ? (
                                    <FaEyeSlash className="h-5 w-5" />
                                ) : (
                                    <FaEye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Setting Password...
                            </>
                        ) : (
                            "Set Password"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetPassword;
