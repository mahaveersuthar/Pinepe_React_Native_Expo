package `in`.pinepe.pinepe.aeps

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.util.Log
import com.aeps.aepslib.newCode.AepsActivity
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.random.Random
import android.graphics.Color

class AepsModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private var aepsPromise: Promise? = null

    companion object {
        private const val AEPS_REQUEST_CODE = 300
        private const val TAG = "AEPS"
    }

    /* -------------------- Activity Result Listener -------------------- */

    private val activityEventListener = object : ActivityEventListener {

        override fun onActivityResult(
            activity: Activity,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
        ) {
            Log.d(TAG, "onActivityResult called requestCode=$requestCode resultCode=$resultCode")

            if (requestCode != AEPS_REQUEST_CODE) {
                Log.w(TAG, "Ignored result: wrong requestCode")
                return
            }

            if (aepsPromise == null) {
                Log.w(TAG, "Promise is null, ignoring result")
                return
            }

            try {
                // Treat non-OK results as cancellations unless app defines otherwise
                if (resultCode != Activity.RESULT_OK) {
    Log.w(TAG, "AEPS resultCode not OK: $resultCode")

    // 🔥 READ MESSAGE FROM INTENT (IF PRESENT)
    val message = data?.getStringExtra("message")
        ?: "AEPS cancelled or closed by user"

    val statusCode = data?.getStringExtra("statusCode")
        ?: "CANCELLED"

    val dataJson = data?.getStringExtra("data") ?: "{}"

    val dataObj = try {
        JSONObject(dataJson)
    } catch (e: Exception) {
        JSONObject()
    }

    val result = JSONObject().apply {
        put("statusCode", statusCode)
        put("message", message)
        put("data", dataObj)
    }

    aepsPromise?.resolve(result.toString())
    aepsPromise = null
    return
}



                if (data == null) {
                    Log.w(TAG, "AEPS cancelled by user (data is null)")
                    aepsPromise?.reject("CANCELLED", "AEPS cancelled by user")
                    aepsPromise = null
                    return
                }

                val message = data.getStringExtra("message") ?: ""
                val statusCode = data.getStringExtra("statusCode") ?: ""
                val dataJson = data.getStringExtra("data") ?: "{}"

                Log.d(TAG, "AEPS RESULT → message=$message status=$statusCode data=$dataJson")

                val dataObj = try {
                    JSONObject(dataJson)
                } catch (e: Exception) {
                    Log.w(TAG, "AEPS data is not valid JSON, preserving raw value")
                    JSONObject().apply { put("raw", dataJson) }
                }

                // Only show the alert if the activity is still valid
                try {
                    val canShowDialog = !(activity.isFinishing || (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN_MR1 && activity.isDestroyed))
                    if (canShowDialog) {
                        val builderMessage = StringBuilder().apply {
                            append(message)
                            append("\nBank: ${dataObj.optString("bankName")}")
                            append("\nRRN: ${dataObj.optString("bankrefrenceNo")}")
                            append("\nService: ${dataObj.optString("service")}")
                            append("\nSTAN: ${dataObj.optString("stanNo")}")
                            append("\nAmount: ${dataObj.optString("transactionAmount")}")
                            append("\nTxn ID: ${dataObj.optString("transactionId")}")
                            append("\nTxn No: ${dataObj.optString("transactionNO")}")
                            append("\nUID: ${dataObj.optString("uidNo")}")
                        }.toString()

                        showAlertDialog(activity, builderMessage)
                    } else {
                        Log.w(TAG, "Activity finishing/destroyed; skipping result dialog")
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to show AEPS dialog", e)
                }

                val result = JSONObject().apply {
                    put("message", message)
                    put("statusCode", statusCode)
                    put("data", dataObj)
                }

                Log.d(TAG, "Resolving promise with success result")
                aepsPromise?.resolve(result.toString())

            } catch (e: Exception) {
                Log.e(TAG, "AEPS ERROR while processing result", e)
                aepsPromise?.reject("ERROR", e.message, e)
            } finally {
                Log.d(TAG, "Clearing AEPS promise")
                aepsPromise = null
            }
        }

        override fun onNewIntent(intent: Intent) {
            Log.d(TAG, "onNewIntent called (ignored)")
        }
    }

    init {
        Log.d(TAG, "AepsModule initialized")
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = "AepsModule"

    /* -------------------- React Method -------------------- */

    @ReactMethod
    fun startAeps(
        agentId: String,
        developerId: String,
        password: String,
        bankVendorType: String,
        promise: Promise
    ) {
        Log.d(TAG, "startAeps called from JS")

        if (aepsPromise != null) {
            Log.w(TAG, "AEPS already running")
            promise.reject("IN_PROGRESS", "AEPS already running")
            return
        }

        val activity = reactContext.currentActivity
        if (activity == null) {
            Log.e(TAG, "Current activity is NULL")
            promise.reject("NO_ACTIVITY", "Activity is null")
            return
        }

        aepsPromise = promise

        val transactionId = createMultipleTransactionID()
        Log.d(TAG, "Generated Transaction ID: $transactionId")

        val intent = Intent(activity, AepsActivity::class.java).apply {
            putExtra("agent_id", agentId)
            putExtra("developer_id", developerId)
            putExtra("password", password)

            putExtra("primary_color", Color.parseColor("#0D47A1"))       // Blue
            putExtra("accent_color", Color.parseColor("#FF9800"))        // Orange
            putExtra("primary_dark_color", Color.parseColor("#0B3C91"))  // Dark Blue


            putExtra("bankVendorType", bankVendorType)
            putExtra("clientTransactionId", transactionId)
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }

        Log.d(TAG, "Launching AepsActivity")
        activity.startActivityForResult(intent, AEPS_REQUEST_CODE)
    }

    /* -------------------- Alert Dialog -------------------- */

    private fun showAlertDialog(activity: Activity, message: String) {
        Log.d(TAG, "Showing AEPS result dialog")
        activity.runOnUiThread {
            AlertDialog.Builder(activity)
                .setTitle("AEPS Transaction")
                .setMessage(message)
                .setCancelable(false)
                .setPositiveButton("OK") { dialog, _ ->
                    dialog.dismiss()
                }
                .show()
        }
    }

    /* -------------------- Transaction ID -------------------- */

    private fun createMultipleTransactionID(): String {
        val sdf = SimpleDateFormat("yyMMddHHmmssSS", Locale.US)
        val timePart = sdf.format(Date())
        val randomPart = Random.nextInt(100000, 999999)
        return "$timePart$randomPart"
    }
}
