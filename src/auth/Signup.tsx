import React, { useState } from "react";
import Discord from "./Discord";
import SignupForm from "./SignupForm";

export default function Signup() {
    const [value, setValue] = useState<any>({})

    return (
        <div className="auth__form-wrapper">
            <h1 className="auth__h1">ITCOBKAI</h1>
            {Object.keys(value).length
                ? <SignupForm value={value} setValue={setValue} />
                : <Discord setValue={setValue} />
            }
            <div className="auth__form-footer">
                <p>制作: 笠井@eulious</p>
            </div>
        </div>
    )
}