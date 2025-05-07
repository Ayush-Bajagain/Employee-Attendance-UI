import axios from "axios";
import { useForm } from "react-hook-form";

import { useParams } from "react-router-dom";

const SetPassword = () => {
    const {uuid} = useParams()

    const {register, handleSubmit, watch, formState:{errors}} = useForm();


    const handleFormSubmit = async (data) => {
        try{
            const response = await axios.post("http://localhost:8080/api/v1/auth/setPassword",
                {
                    password: data.password,
                    confirmPassword: data.confirmPassword,
                    uuid: uuid
                }
            )

        }catch(error) {
            console.log(error);
        }
    }
        
        
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <input
        type="password"
        {...register("password", {
            required: "password is required"
        })}
        placeholder="Password"
        className=""
      />

      <input
        type="password"
        placeholder="Confirm Password"
        {...register("confirmPassword", {
            required: "password is required",
            validate: (val) => val === watch("password") || "password must be match..."
        })}
        className=""
      />

      {errors.confirmPassword && <span className="text-red-600">{errors.confirmPassword.message}</span>}

      <button type="submit">
        Confirm
      </button>
    </form>
  );
};

export default SetPassword;
