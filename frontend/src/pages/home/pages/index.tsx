import { Alert, Divider, Grid, Typography } from '@mui/material';
import CommonPageLayout from '../../../components/CommonPageLayout';
import useStudent from '../../participants/services/StudentService';
import { useState, useEffect } from 'react';
import StudentBox from '../../participants/components/StudentBox';
import { IStudent } from '../../participants/types/StudentTypes';
import { ISchool } from '../../school/types/SchoolTypes';
import useSchool from '../../school/services/SchoolService';
import SchoolBox from '../../school/components/SchoolBox';

const HomePage = () => {
    // useEffect(() => {
    //   subscribe();
    // }, []);
    const studentServ = useStudent();
    const schoolServ = useSchool();

    const [students, setStudents] = useState<IStudent[]>([]);
    const [schools, setSchools] = useState<ISchool[]>([]);

    useEffect(() => {
        studentServ.getAll()
            .then((res) => setStudents(res.data.sort((a, b) => {
                return (b.score ?? 0) - (a.score ?? 0);
            }).slice(0, 3)));
        schoolServ.getAll()
            .then((res) => setSchools(res.data.sort((a, b) => {
                return (b.score ?? 0) - (a.score ?? 0);
            }).slice(0, 3)));
    }, []);
    return (
        <CommonPageLayout >
            {/* <Container> */}
            {students.length > 0 && <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h4" color="initial" textAlign={'center'}>
                        KALAPRATHIBHA
                    </Typography>
                    <Divider />
                </Grid>
                {students.sort((a, b) => {
                    return (b.score ?? 0) - (a.score ?? 0);
                }).map(student =>
                    <Grid item xs={6} md={4} lg={3} key={student._id}>
                        <StudentBox value={student} score={student.score ?? 0} school={true} />
                    </Grid>
                )}

            </Grid>}
            <br />
            <br />
            {schools.length > 0 && <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h4" color="initial" textAlign={'center'}>
                        SCHOOL
                    </Typography>
                    <Divider />
                </Grid>
                {schools.map(school =>
                    <Grid item xs={6} md={4} lg={3} key={school._id}>
                        <SchoolBox value={school} />
                    </Grid>
                )}
            </Grid>}
            {/* </Container> */}
        </CommonPageLayout>
    );
};

export default HomePage;
