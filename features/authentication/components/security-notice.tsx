import { LockKeyhole } from "lucide-react";

import styles from "./login.module.css";

export function SecurityNotice() {
  return (
    <div className={styles.securityNotice}>
      <LockKeyhole aria-hidden="true" size={17} />
      <p>
        Secure organizational access
        <span>
          สำหรับผู้ใช้งานที่ได้รับอนุญาต ระบบประมวลผลข้อมูลตามแนวทาง PDPA
        </span>
      </p>
    </div>
  );
}
