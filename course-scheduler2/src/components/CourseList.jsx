import {useState, useEffect} from "react";
import CourseCard from "./CourseCard";
import ProgressSummary from "./ProgressSummary";
import useFetch from "../hooks/useFetch.js";

function CourseList(props) {
    const btnGroupStyle = {
        maxWidth: "500px",
    }

    const [selected, setSelected] = useState("All Courses");
    const options = ["All Courses", "Completed Only", "Remaining"];
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const { data: savedCompletions } = useFetch(`${BASE_URL}/completions`)
    const [completed, setCompleted] = useState([])

// NOTE: when the fetch finishes, copy the server's list into editable state
    useEffect(() => {
        if (Array.isArray(savedCompletions)) setCompleted(savedCompletions)
    }, [savedCompletions])

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage("");

        try {
            const response = await fetch(`${BASE_URL}/completions`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify( completed)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to save progress.");
            }

            setSaveMessage("Progress saved successfully!");

        } catch (error) {
            setSaveMessage(error.message);
        } finally {
            setIsSaving(false);
        }
    };
    const handleToggleCourse = (courseId, isChecked) => {
        setSaveMessage("");
        setCompleted((prevIds) => {
            if (isChecked) {
                return [...prevIds, courseId];
            }

            let updatedIds = prevIds.filter(
                (id) => String(id) !== String(courseId)
            );

            let changed = true;

            while (changed) {
                changed = false;

                props.courses.forEach((course) => {
                    const isCompleted = updatedIds.some(
                        (id) => String(id) === String(course.id)
                    );

                    const hasMissingPrerequisite =
                        !(course.prerequisites ?? []).every((prereqID) =>
                            updatedIds.some(
                                (id) => String(id) === String(prereqID)
                            )
                        );

                    if (isCompleted && hasMissingPrerequisite) {
                        updatedIds = updatedIds.filter(
                            (id) => String(id) !== String(course.id)
                        );

                        changed = true;
                    }
                });
            }

            return updatedIds;
        });
    };

    const filteredCourses = props.courses?.filter((course) => {
        const isCompleted = completed.includes(course.id);
        if (selected === "Completed Only") return isCompleted;
        if (selected === "Remaining") return !isCompleted;
        return true;
    });

    const courses = props.courses ?? []
    const savedCompletionsSet = new Set(completed.map((id) => String(id)));


    const totalCourses = courses.length;

    const completedCourses = courses.filter((course) =>
        savedCompletionsSet.has(String(course.id))
    ).length;

    const remainingCourses = totalCourses - completedCourses;

    const availableCourses = courses.filter((course) =>
        !savedCompletionsSet.has(String(course.id)) &&
        (course.prerequisites ?? []).every((prereqID) =>
            savedCompletionsSet.has(String(prereqID))
        )
    );

    const lockedCourses = courses.filter((course) =>
        !savedCompletionsSet.has(String(course.id)) &&
        !(course.prerequisites ?? []).every((prereqID) =>
            savedCompletionsSet.has(String(prereqID))
        )
    );

    const progress = totalCourses > 0 ? ((completedCourses/totalCourses) * 100).toFixed() : 0;

    return (
        <>
            <ProgressSummary
                completed={completedCourses}
                available={availableCourses?.length ?? 0}
                locked={lockedCourses?.length ?? 0}
                remaining={remainingCourses}
                total={totalCourses}
                progress={progress}
            />

            <div className="d-flex justify-content-between align-items-center gap-2 mt-3 mb-3 flex-nowrap">
                <div className="btn-group" style={btnGroupStyle}>
                    {options.map((option) => (
                        <button
                            key={option}
                            type = "button"
                            className={`btn ${selected === option ? "course-btn-selected" : "course-btn"}`}
                            onClick={() => setSelected(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div className="d-flex align-items-center gap-2">

                    {saveMessage && (
                        <span className={`alert ${saveMessage.includes("successfully") ? "text-success" : "text-danger"} `}>
        {saveMessage}
    </span>
                    )}


                    <button className="btn btn-success" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save"}
                    </button>

                </div>
            </div>

            <div className="row g-3 mt-3">
                {filteredCourses?.map((course)=>{
                    const isCompleted = completed.some((id) => String(id) === String(course.id));

                    const isAvailable = (course.prerequisites ?? [])
                        .every((prereqID) => completed.some((id) => String(id) === String(prereqID)));

                    return(
                        <div className="col-12 col-md-6 col-lg-4" key={course.id}>
                            <CourseCard
                                course={course}
                                courses={props.courses}
                                checked={completed.includes(course.id)}
                                locked={!isCompleted && !isAvailable}
                                onChange={(isChecked) => handleToggleCourse(course.id, isChecked)}
                            />
                        </div>
                    )

                })}
            </div>
        </>
    )
}

export default CourseList;